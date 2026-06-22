import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, onClick, type = 'button' }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, type = 'text', value, onChange, placeholder, required, error, className = '' }) {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, required, error, rows = 4, className = '' }) {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`textarea ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, required, className = '' }) {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select value={value} onChange={onChange} className="select">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({ label, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
