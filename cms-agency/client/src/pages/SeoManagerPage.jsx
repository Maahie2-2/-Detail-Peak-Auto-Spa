import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Textarea } from '../components/ui';
import { addGlobalToast } from '../components/Modal';

export default function SeoManagerPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPages(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO Manager</h1>
        <p className="text-gray-500">Manage SEO settings for all pages</p>
      </div>
      <div className="space-y-4">
        {pages.map((page) => (
          <div key={page.name} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 capitalize">{page.name}</h2>
                <p className="text-sm text-gray-500">{page.filename}</p>
              </div>
              <Link to={`/pages/${page.name}/edit`} className="btn-primary text-sm">
                Edit SEO
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Meta Title</p>
                <p className="text-gray-900 truncate">Loading...</p>
              </div>
              <div>
                <p className="text-gray-500">Meta Description</p>
                <p className="text-gray-900 truncate">Loading...</p>
              </div>
              <div>
                <p className="text-gray-500">Canonical</p>
                <p className="text-gray-900 truncate">Loading...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Tip</h2>
        <p className="text-sm text-gray-600">
          Click "Edit SEO" on any page to open the page editor. Switch to the "SEO" tab to edit meta titles, descriptions, Open Graph tags, and schema markup for that page.
        </p>
      </div>
    </div>
  );
}
