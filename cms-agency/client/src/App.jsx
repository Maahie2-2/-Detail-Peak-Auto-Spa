import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PagesListPage from './pages/PagesListPage';
import PageEditorPage from './pages/PageEditorPage';
import CollectionManagerPage from './pages/CollectionManagerPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import SeoManagerPage from './pages/SeoManagerPage';
import SettingsPage from './pages/SettingsPage';

function AuthGuard({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
        <Route index element={<DashboardPage />} />
        <Route path="pages" element={<PagesListPage />} />
        <Route path="pages/:slug/edit" element={<PageEditorPage />} />
        <Route path="blog" element={<CollectionManagerPage />} />
        <Route path="services" element={<CollectionManagerPage />} />
        <Route path="packages" element={<CollectionManagerPage />} />
        <Route path="vehicles" element={<CollectionManagerPage />} />
        <Route path="testimonials" element={<CollectionManagerPage />} />
        <Route path="faqs" element={<CollectionManagerPage />} />
        <Route path="team" element={<CollectionManagerPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="seo" element={<SeoManagerPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
