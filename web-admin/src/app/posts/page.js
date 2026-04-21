'use client';

import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { feedAPI } from '@/services/api';
import { formatTimeAgo } from '@/utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, 
  faPaperPlane, 
  faImage, 
  faVideo, 
  faFilePdf, 
  faFileWord,
  faFile,
  faTimes,
  faDownload,
  faPaperclip
} from '@fortawesome/free-solid-svg-icons';
import { showToast } from '@/utils/toast';
import { confirmDialog } from '@/components/ConfirmDialog';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showToast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        showToast.error(`${file.name} is not a supported file type`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > 5) {
      showToast.error('Maximum 5 attachments allowed');
      return;
    }

    // Convert files to base64 for preview and storage
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments(prev => [...prev, {
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          preview: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return faImage;
    if (type.startsWith('video/')) return faVideo;
    if (type === 'application/pdf') return faFilePdf;
    if (type.includes('word')) return faFileWord;
    return faFile;
  };

  const getFileColor = (type) => {
    if (type.startsWith('image/')) return 'text-green-600 bg-green-50';
    if (type.startsWith('video/')) return 'text-purple-600 bg-purple-50';
    if (type === 'application/pdf') return 'text-red-600 bg-red-50';
    if (type.includes('word')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && attachments.length === 0) {
      showToast.error('Please add content or attachments');
      return;
    }

    setSubmitting(true);
    try {
      const postData = {
        content: postContent.trim(),
        attachments: attachments.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size,
          data: att.preview
        }))
      };

      await feedAPI.createPost(postData);
      showToast.success('Announcement posted successfully!');
      setPostContent('');
      setAttachments([]);
      loadPosts();
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Posts Management</h2>
          <p className="text-gray-600">Create and manage announcements for students</p>
        </div>

        {/* Enhanced Create Announcement Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary via-primary-dark to-primary p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faBullhorn} className="text-2xl text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">Create Announcement</h3>
                <p className="text-sm text-white/90">Share important updates with all students</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{posts.length}</div>
                <div className="text-xs text-white/80">Total Posts</div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleCreatePost} className="p-6">
            {/* Text Area */}
            <div className="mb-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition resize-none text-gray-800"
                rows="5"
                placeholder="Write an announcement for students... 📢"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {postContent.length}/1000 characters
                </span>
                {attachments.length > 0 && (
                  <span className="text-sm text-primary font-medium">
                    {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
                  </span>
                )}
              </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative group">
                    <div className={`border-2 border-dashed rounded-xl p-4 ${getFileColor(attachment.type)} border-current/20 hover:border-current/40 transition`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(attachment.type)}`}>
                          <FontAwesomeIcon icon={getFileIcon(attachment.type)} className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{attachment.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                      
                      {/* Image Preview */}
                      {attachment.type.startsWith('image/') && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img 
                            src={attachment.preview} 
                            alt={attachment.name}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 5}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faPaperclip} />
                <span>Attach Files ({attachments.length}/5)</span>
              </button>

              <button
                type="submit"
                disabled={(!postContent.trim() && attachments.length === 0) || submitting}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
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

            {/* File Type Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Supported files:</strong> Images (JPG, PNG, GIF), Videos (MP4, WebM), Documents (PDF, Word, Excel) • Max 10MB per file • Up to 5 files
              </p>
            </div>
          </form>
        </div>

        {/* Enhanced Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search posts by content or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            // Enhanced Skeleton Loading
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faBullhorn} className="text-4xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No posts found</p>
              <p className="text-gray-400 text-sm mt-1">Create your first announcement to get started!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {post.author?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{post.author?.name}</p>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                    {post.isPinned && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                        📌 Pinned
                      </span>
                    )}
                    {post.author?.role && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                        {post.author.role}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                
                {/* Attachments Display */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className={`border-2 rounded-xl p-4 ${getFileColor(attachment.type)} border-current/20`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(attachment.type)}`}>
                            <FontAwesomeIcon icon={getFileIcon(attachment.type)} className="text-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{attachment.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                          <a
                            href={attachment.data}
                            download={attachment.name}
                            className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition"
                            title="Download"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </a>
                        </div>
                        
                        {/* Image Preview */}
                        {attachment.type.startsWith('image/') && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img 
                              src={attachment.data} 
                              alt={attachment.name}
                              className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(attachment.data, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comments?.length || 0} comments
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <span>Showing {filteredPosts.length} of {posts.length} posts</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-primary hover:text-primary-dark font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
