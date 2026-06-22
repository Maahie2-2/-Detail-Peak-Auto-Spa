import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

export function RelationPicker({ value, onChange, collection, multiple = false, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${collection}`);
      const data = await res.json();
      if (data.success) setItems(data.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const open = () => {
    fetchItems();
    setIsOpen(true);
  };

  const toggleItem = (id) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(id)) {
        onChange(current.filter((v) => v !== id));
      } else {
        onChange([...current, id]);
      }
    } else {
      onChange(id);
      setIsOpen(false);
    }
  };

  const currentValues = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];
  const selectedLabels = items
    .filter((item) => currentValues.includes(item.id))
    .map((item) => item.fields?.title || item.fields?.name || item.fields?.question || item.id)
    .join(', ');

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm min-h-[38px] truncate">
          {selectedLabels || 'None selected'}
        </div>
        <button onClick={open} className="btn-secondary text-sm px-3 py-2">
          Select
        </button>
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Select from ${collection}`} size="md">
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && <p className="text-center text-gray-500 py-4">Loading...</p>}
          {items.length === 0 && !loading && <p className="text-center text-gray-500 py-4">No items found.</p>}
          <div className="space-y-2">
            {items.map((item) => {
              const label = item.fields?.title || item.fields?.name || item.fields?.question || item.id;
              const selected = currentValues.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                  }`}>
                    {selected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm text-gray-900">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
