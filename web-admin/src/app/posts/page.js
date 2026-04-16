'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { feedAPI } from '@/services/api';
import { formatTimeAgo } from '@/utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '@/utils/toast';
import { confirmDialog } from '@/components/ConfirmDialog';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await feedAPI.getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setSubmitting(true);
    try {
      await feedAPI.createPost(postContent.trim());
      showToast.success('Announcement posted successfully!');
      setPostContent('');
      loadPosts(); // Reload posts
    } catch (error) {
      showToast.error('Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    const confirmed = await confirmDialog('Are you sure you want to delete this post?');
    if (!confirmed) return;

    try {
      await feedAPI.deletePost(id);
      showToast.success('Post deleted successfully');
      loadPosts();
    } catch (error) {
      showToast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.content?.toLowerCase().includes(search.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Posts Management</h2>

        {/* Create Announcement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faBullhorn} className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Create Announcement</h3>
                <p className="text-sm text-white/80">Post updates for all students</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleCreatePost} className="p-6">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition resize-none"
              rows="4"
              placeholder="Write an announcement for students..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {postContent.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={!postContent.trim() || submitting}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Post Announcement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton Loading
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No posts found
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {post.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{post.author?.name}</p>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                    {post.isPinned && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        📌 Pinned
                      </span>
                    )}
                    {post.author?.role && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {post.author.role}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                
                <p className="text-gray-700 mb-3">{post.content}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>💬 {post.comments?.length || 0} comments</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>
    </AdminLayout>
  );
}
