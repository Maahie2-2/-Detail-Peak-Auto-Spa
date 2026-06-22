import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState({ pages: 0, posts: 0, media: 0, services: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [pagesRes, postsRes, mediaRes, servicesRes] = await Promise.all([
          fetch('/api/pages'),
          fetch('/api/collections/blog-posts'),
          fetch('/api/media'),
          fetch('/api/collections/services'),
        ]);
        const [pagesData, postsData, mediaData, servicesData] = await Promise.all([
          pagesRes.json(), postsRes.json(), mediaRes.json(), servicesRes.json(),
        ]);
        setStats({
          pages: pagesData.data?.length || 0,
          posts: postsData.data?.items?.length || 0,
          media: mediaData.data?.length || 0,
          services: servicesData.data?.items?.length || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Pages', value: stats.pages, path: '/pages', color: 'bg-blue-50 text-blue-700' },
    { label: 'Blog Posts', value: stats.posts, path: '/blog', color: 'bg-purple-50 text-purple-700' },
    { label: 'Media Files', value: stats.media, path: '/media', color: 'bg-green-50 text-green-700' },
    { label: 'Services', value: stats.services, path: '/services', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your website content</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.path} className={`card p-6 hover:shadow-md transition-shadow ${card.color}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{loading ? '...' : card.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/pages" className="btn-primary">Edit Pages</Link>
          <Link to="/blog" className="btn-primary">Manage Blog</Link>
          <Link to="/media" className="btn-secondary">Upload Media</Link>
          <Link to="/settings" className="btn-secondary">Site Settings</Link>
        </div>
      </div>
    </div>
  );
}
