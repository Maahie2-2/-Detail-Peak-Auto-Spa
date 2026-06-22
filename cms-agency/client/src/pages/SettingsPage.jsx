import React, { useEffect, useState } from 'react';
import { Button, Input, Textarea } from '../components/ui';
import { addGlobalToast } from '../components/Modal';

const SETTINGS_TABS = [
  { key: 'business', label: 'Business Info' },
  { key: 'seo', label: 'Global SEO' },
  { key: 'branding', label: 'Branding' },
  { key: 'security', label: 'Security' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [activeTab]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/${activeTab}`);
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/settings/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        addGlobalToast('Settings saved');
      } else {
        addGlobalToast(data.message || 'Save failed', 'error');
      }
    } catch (e) {
      addGlobalToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addGlobalToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addGlobalToast('Password must be at least 6 characters', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addGlobalToast('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        addGlobalToast(data.message || 'Password change failed', 'error');
      }
    } catch (e) {
      addGlobalToast('Network error', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const renderFields = () => {
    switch (activeTab) {
      case 'business':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Business Name" value={settings.name || ''} onChange={(e) => updateField('name', e.target.value)} />
            <Input label="Phone" value={settings.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            <Input label="Email" value={settings.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            <Input label="Website" value={settings.website || ''} onChange={(e) => updateField('website', e.target.value)} />
            <Input label="Address" value={settings.address || ''} onChange={(e) => updateField('address', e.target.value)} className="md:col-span-2" />
            <Textarea label="Business Hours" value={settings.hours || ''} onChange={(e) => updateField('hours', e.target.value)} className="md:col-span-2" />
          </div>
        );
      case 'seo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Default Title" value={settings.defaultTitle || ''} onChange={(e) => updateField('defaultTitle', e.target.value)} />
            <Input label="Google Analytics ID" value={settings.googleAnalyticsId || ''} onChange={(e) => updateField('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" />
            <Textarea label="Default Description" value={settings.defaultDescription || ''} onChange={(e) => updateField('defaultDescription', e.target.value)} className="md:col-span-2" />
          </div>
        );
      case 'branding':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Logo URL" value={settings.logo || ''} onChange={(e) => updateField('logo', e.target.value)} />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input label="Primary Color" value={settings.primaryColor || ''} onChange={(e) => updateField('primaryColor', e.target.value)} />
              </div>
              <input type="color" value={settings.primaryColor || '#2563eb'} onChange={(e) => updateField('primaryColor', e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded mt-6" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input label="Secondary Color" value={settings.secondaryColor || ''} onChange={(e) => updateField('secondaryColor', e.target.value)} />
              </div>
              <input type="color" value={settings.secondaryColor || '#1e40af'} onChange={(e) => updateField('secondaryColor', e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded mt-6" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input label="Accent Color" value={settings.accentColor || ''} onChange={(e) => updateField('accentColor', e.target.value)} />
              </div>
              <input type="color" value={settings.accentColor || '#f59e0b'} onChange={(e) => updateField('accentColor', e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded mt-6" />
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4 max-w-md">
            <Input
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <div className="mt-4">
              <Button variant="primary" onClick={handlePasswordChange} disabled={passwordSaving}>
                {passwordSaving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your site-wide settings</p>
      </div>
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="card p-6">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : (
          <div>
            {renderFields()}
            {activeTab !== 'security' && (
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
