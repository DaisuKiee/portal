'use client';

import { useState, useEffect } from 'react';

let confirmCallback = null;

export const confirmDialog = (message) => {
  return new Promise((resolve) => {
    confirmCallback = resolve;
    const event = new CustomEvent('showConfirm', { detail: { message } });
    window.dispatchEvent(event);
  });
};

export default function ConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleShowConfirm = (e) => {
      setMessage(e.detail.message);
      setIsOpen(true);
    };

    window.addEventListener('showConfirm', handleShowConfirm);
    return () => window.removeEventListener('showConfirm', handleShowConfirm);
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (confirmCallback) {
      confirmCallback(true);
      confirmCallback = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (confirmCallback) {
      confirmCallback(false);
      confirmCallback = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Confirm Action
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
