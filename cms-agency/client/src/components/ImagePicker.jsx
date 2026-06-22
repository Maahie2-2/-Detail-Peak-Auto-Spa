import React, { useState } from 'react';
import { Modal } from './Modal';

export function ImagePicker({ value, onChange, multiple = false, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) setImages(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const open = () => {
    fetchImages();
    setIsOpen(true);
  };

  const selectImage = (url) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(url)) {
        onChange(current.filter((u) => u !== url));
      } else {
        onChange([...current, url]);
      }
    } else {
      onChange(url);
      setIsOpen(false);
    }
  };

  const removeImage = (url) => {
    if (multiple) {
      onChange(value.filter((u) => u !== url));
    } else {
      onChange('');
    }
  };

  const currentValues = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {currentValues.map((url) => (
          <div key={url} className="relative group">
            <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
            <button
              onClick={() => removeImage(url)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={open}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Image" size="lg">
        <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
          {loading && <p className="col-span-4 text-center text-gray-500">Loading...</p>}
          {images.length === 0 && !loading && <p className="col-span-4 text-center text-gray-500">No images uploaded yet.</p>}
          {images.map((img) => {
            const selected = currentValues.includes(img.url);
            return (
              <div
                key={img.filename}
                onClick={() => selectImage(img.url)}
                className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                  selected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={img.url} alt={img.filename} className="w-full h-24 object-cover" />
                <p className="text-xs text-gray-600 p-2 truncate">{img.filename}</p>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
