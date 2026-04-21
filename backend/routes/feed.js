const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName email role')
      .sort({ isPinned: -1, createdAt: -1 }) // Pinned posts first, then by date
      .limit(50);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: {
        name: post.authorName || post.author?.fullName || 'Unknown User',
        avatar: null,
        role: post.author?.role === 'admin' ? 'Admin' : post.author?.role === 'staff' ? 'Staff' : null
      },
      content: post.content,
      attachments: post.attachments || [],
      timestamp: getTimeAgo(post.createdAt),
      isPinned: post.isPinned || false,
      comments: post.comments.map(comment => ({
        id: comment._id,
        author: comment.authorName,
        content: comment.content,
        timestamp: getTimeAgo(comment.createdAt)
      }))
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own posts
router.get('/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: {
        name: post.authorName,
        avatar: null,
        role: null
      },
      content: post.content,
      timestamp: getTimeAgo(post.createdAt),
      commentsCount: post.comments.length,
      comments: post.comments.map(comment => ({
        id: comment._id,
        author: comment.authorName,
        content: comment.content,
        timestamp: getTimeAgo(comment.createdAt)
      }))
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { content, attachments } = req.body;

    // Validate that either content or attachments exist
    if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Content or attachments are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Automatically pin posts from admins
    const isPinned = user.role === 'admin';

    const post = new Post({
      author: req.user.id,
      authorName: user.fullName,
      authorRole: user.role || 'student',
      content: content ? content.trim() : '',
      attachments: attachments || [],
      isPinned: isPinned
    });

    await post.save();

    // If admin posts, notify all students
    if (user.role === 'admin') {
      try {
        // Get all students (users who are not admin or staff)
        const students = await User.find({ 
          role: { $nin: ['admin', 'staff'] } 
        }).select('_id');

        // Create notifications for all students
        const notifications = students.map(student => ({
          user: student._id,
          type: 'announcement',
          title: 'New Announcement',
          message: `${user.fullName} posted a new announcement`,
          data: { postId: post._id }
        }));

        // Bulk insert notifications
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          console.log(`Created ${notifications.length} notifications for admin post`);
        }
      } catch (notifError) {
        console.error('Error creating notifications for admin post:', notifError);
        // Continue even if notifications fail
      }
    }

    res.status(201).json({
      id: post._id,
      author: {
        name: post.authorName,
        avatar: null,
        role: user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : null
      },
      content: post.content,
      attachments: post.attachments || [],
      timestamp: 'Just now',
      isPinned: post.isPinned,
      comments: []
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = {
      author: req.user.id,
      authorName: user.fullName,
      content: content.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Create notification for post author if it's not their own comment
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        user: post.author,
        type: 'comment',
        title: 'New Comment',
        message: `${user.fullName} commented on your post`,
        data: { postId: post._id }
      });
    }

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      id: newComment._id,
      author: comment.authorName,
      content: comment.content,
      timestamp: 'Just now'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or an admin
    const user = await User.findById(req.user.id);
    if (post.author.toString() !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to format time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

module.exports = router;
