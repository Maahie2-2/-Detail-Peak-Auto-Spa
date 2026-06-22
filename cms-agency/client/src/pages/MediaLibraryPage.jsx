import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui';
import { addGlobalToast } from '../components/Modal';

export default function MediaLibraryPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) setFiles(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (fileList) => {
    if (!fileList.length) return;
    setUploading(true);
    const formData = new FormData();
    for (const file of fileList) {
      formData.append('files', file);
    }
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        addGlobalToast(`${data.data.length} file(s) uploaded`);
        fetchFiles();
      } else {
        addGlobalToast(data.message || 'Upload failed', 'error');
      }
    } catch (e) {
      addGlobalToast('Upload error', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addGlobalToast('File deleted');
        fetchFiles();
      } else {
        addGlobalToast(data.message || 'Delete failed', 'error');
      }
    } catch (e) {
      addGlobalToast('Delete error', 'error');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      addGlobalToast('URL copied to clipboard');
    });
  };

  const filtered = files.filter((f) => f.filename.toLowerCase().includes(search.toLowerCase()));

  const isImage = (filename) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500">Manage your uploaded images</p>
        </div>
        <label className="btn-primary cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      <div
        className={`card p-6 min-h-[300px] ${dragOver ? 'border-2 border-dashed border-primary-500 bg-primary-50' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
      >
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No images uploaded yet.</p>
            <p className="text-sm mt-2">Drag and drop images here or click "Upload Images"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((file) => (
              <div key={file.filename} className="group relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                {isImage(file.filename) ? (
                  <img src={file.url} alt={file.filename} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center text-gray-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs text-gray-700 truncate">{file.filename}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(window.location.origin + file.url)} className="p-2 bg-white rounded-full text-gray-700 hover:text-primary-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(file.filename)} className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
