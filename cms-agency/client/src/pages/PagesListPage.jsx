import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { Modal } from '../components/Modal';
import { addGlobalToast } from '../components/Modal';

export default function PagesListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPages = () => {
    fetch('/api/pages')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPages(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async () => {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!slug) {
      addGlobalToast('Please enter a valid page slug', 'error');
      return;
    }
    if (pages.find((p) => p.name === slug)) {
      addGlobalToast('A page with that slug already exists', 'error');
      return;
    }
    setCreating(true);
    const newPage = {
      slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      meta: {
        title: '',
        description: '',
        canonical: '',
        og: { title: '', description: '', image: '' },
        schema: '',
      },
      sections: [],
    };
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });
      const data = await res.json();
      if (data.success) {
        addGlobalToast('Page created');
        setNewModalOpen(false);
        setNewSlug('');
        setLoading(true);
        fetchPages();
      } else {
        addGlobalToast(data.message || 'Failed to create page', 'error');
      }
    } catch (e) {
      addGlobalToast('Network error', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500">Manage your website pages</p>
        </div>
        <Button variant="primary" onClick={() => setNewModalOpen(true)}>
          + New Page
        </Button>
      </div>
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Pages</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pages.map((page) => (
              <div key={page.name} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{page.name}</p>
                  <p className="text-sm text-gray-500">{page.filename}</p>
                </div>
                <Link
                  to={`/pages/${page.name}/edit`}
                  className="btn-primary text-sm"
                >
                  Edit Page
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={newModalOpen} onClose={() => setNewModalOpen(false)} title="Create New Page" size="md">
        <div className="space-y-4">
          <Input
            label="Page Slug (URL-friendly name)"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="e.g. about, contact, pricing"
            required
          />
          <p className="text-xs text-gray-500">
            Use only lowercase letters, numbers, and hyphens. Examples: "about", "contact-us", "pricing"
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setNewModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreatePage} disabled={creating}>
            {creating ? 'Creating...' : 'Create Page'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
