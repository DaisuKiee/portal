'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faPlus, 
  faEdit, 
  faTrash,
  faTimes,
  faSave,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/services/api';
import { showToast } from '@/utils/toast';
import { confirmDialog } from '@/components/ConfirmDialog';

export default function CoursesPage() {
  const [courses, setcourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    studentLimit: '',
    minimumGWA: '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await adminAPI.getCourses();
      setcourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCourse) {
        await adminAPI.updateCourse(editingCourse._id, formData);
        showToast.success('Course updated successfully');
      } else {
        await adminAPI.createCourse(formData);
        showToast.success('Course created successfully');
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ name: '', code: '', description: '', studentLimit: '', minimumGWA: '' });
      loadCourses();
    } catch (error) {
      showToast.error('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      studentLimit: course.studentLimit || '',
      minimumGWA: course.minimumGWA || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirmDialog(`Are you sure you want to delete: ${name}?`);
    if (!confirmed) return;

    try {
      await adminAPI.deleteCourse(id);
      showToast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      showToast.error('Failed to delete course');
    }
  };

  const courseColors = [
    { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-800', border: 'border-green-200' },
    { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
    { bg: 'bg-pink-50', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-800', border: 'border-pink-200' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200' },
  ];

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Courses Management</h2>
            <p className="text-gray-500 mt-1">Manage course offerings and programs</p>
          </div>
          <button
            onClick={() => {
              setEditingCourse(null);
              setFormData({ name: '', code: '', description: '', studentLimit: '', minimumGWA: '' });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Course
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loading Cards
            <>
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="bg-gray-100 p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : courses.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-4xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No courses found</p>
              <p className="text-gray-400 text-sm mt-1">Add your first course to get started!</p>
            </div>
          ) : (
            courses.map((course, index) => {
              const colorScheme = courseColors[index % courseColors.length];
              return (
                <div 
                  key={course._id} 
                  className={`bg-white rounded-2xl shadow-sm border ${colorScheme.border} hover:shadow-lg transition-all duration-200 overflow-hidden group`}
                >
                  <div className={`${colorScheme.bg} p-6 border-b ${colorScheme.border}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 ${colorScheme.bg} rounded-xl flex items-center justify-center border ${colorScheme.border} shadow-sm`}>
                        <FontAwesomeIcon icon={faBook} className={`${colorScheme.text} text-xl`} />
                      </div>
                      <span className={`${colorScheme.badge} px-3 py-1 rounded-full text-xs font-bold tracking-wide`}>
                        {course.code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{course.name}</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {course.description || 'No description available'}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course._id, course.name)}
                        className="flex-1 bg-error text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modern Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faBook} className="text-white text-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCourse(null);
                    }}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="e.g., Bachelor of Science in Information Technology"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono"
                    placeholder="e.g., BSIT"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    rows="4"
                    placeholder="Enter course description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Student Limit
                      <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.studentLimit}
                      onChange={(e) => setFormData({ ...formData, studentLimit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="e.g., 40"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum students allowed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum GWA
                      <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minimumGWA}
                      onChange={(e) => setFormData({ ...formData, minimumGWA: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="e.g., 85"
                      min="65"
                      max="100"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Required GWA (65-100)</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCourse(null);
                      setFormData({ name: '', code: '', description: '', studentLimit: '', minimumGWA: '' });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
