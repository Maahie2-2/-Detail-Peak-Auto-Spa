import React, { useState, useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all transform ${
            toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };
  return { toasts, addToast };
}

// Global toast state for components that can't use hooks
let globalToasts = [];
let globalListeners = [];

export function addGlobalToast(message, type = 'success') {
  const id = Date.now() + Math.random();
  globalToasts = [...globalToasts, { id, message, type }];
  globalListeners.forEach((fn) => fn(globalToasts));
  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    globalListeners.forEach((fn) => fn(globalToasts));
  }, 3000);
}

export function useGlobalToast() {
  const [toasts, setToasts] = useState(globalToasts);
  useEffect(() => {
    globalListeners.push(setToasts);
    return () => {
      globalListeners = globalListeners.filter((fn) => fn !== setToasts);
    };
  }, []);
  return { toasts };
}
