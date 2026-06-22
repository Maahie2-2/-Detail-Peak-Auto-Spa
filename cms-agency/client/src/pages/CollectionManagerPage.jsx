import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Input, Textarea, Toggle } from '../components/ui';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { ImagePicker } from '../components/ImagePicker';
import { collectionRegistry, getCollectionDefaults } from '../config/collections';
import { addGlobalToast } from '../components/Modal';

const routeToCollection = {
  '/blog': 'blog-posts',
  '/services': 'services',
  '/testimonials': 'testimonials',
  '/faqs': 'faqs',
  '/team': 'team',
  '/packages': 'packages',
  '/vehicles': 'vehicles',
};

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function FieldRenderer({ field, value, onChange }) {
  switch (field.type) {
    case 'text':
    case 'url':
      return <Input label={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case 'textarea':
      return <Textarea label={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} rows={4} />;
    case 'number':
      return <Input type="number" label={field.label} value={value || 0} onChange={(e) => onChange(Number(e.target.value))} required={field.required} />;
    case 'image':
      return <ImagePicker label={field.label} value={value} onChange={onChange} />;
    default:
      return <Input label={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

export default function CollectionManagerPage() {
  const location = useLocation();
  const collectionName = routeToCollection[location.pathname];
  const registry = collectionRegistry[collectionName];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!collectionName) return;
    fetch(`/api/collections/${collectionName}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setItems(data.data.items || []);
      })
      .finally(() => setLoading(false));
  }, [collectionName]);

  const saveCollection = async (newItems) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/collections/${collectionName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: collectionName, items: newItems }),
      });
      const data = await res.json();
      if (data.success) {
        addGlobalToast('Saved successfully');
      } else {
        addGlobalToast(data.message || 'Save failed', 'error');
      }
    } catch (e) {
      addGlobalToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingItem({
      id: generateId(collectionName === 'blog-posts' ? 'bp' : collectionName.substring(0, 3)),
      fields: getCollectionDefaults(collectionName),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem({ ...item });
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const newItems = items.filter((i) => i.id !== item.id);
    setItems(newItems);
    saveCollection(newItems);
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    const isNew = !items.find((i) => i.id === editingItem.id);
    let newItems;
    if (isNew) {
      newItems = [...items, { ...editingItem, updatedAt: new Date().toISOString() }];
    } else {
      newItems = items.map((i) => (i.id === editingItem.id ? { ...editingItem, updatedAt: new Date().toISOString() } : i));
    }
    setItems(newItems);
    saveCollection(newItems);
    setModalOpen(false);
  };

  const handleReorder = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIdx]] = [newItems[newIdx], newItems[index]];
    setItems(newItems);
    saveCollection(newItems);
  };

  const updateField = (name, value) => {
    setEditingItem((prev) => ({
      ...prev,
      fields: { ...prev.fields, [name]: value },
    }));
  };

  const columns = registry.fields
    .filter((f) => f.name === 'title' || f.name === 'name' || f.name === 'question' || f.name === 'slug')
    .slice(0, 2)
    .map((f) => ({
      key: f.name,
      label: f.label,
      accessor: (row) => row.fields[f.name] || '',
    }));

  if (!columns.length) {
    columns.push({ key: 'id', label: 'ID', accessor: (row) => row.id });
  }

  if (registry.hasStatus) {
    columns.push({
      key: 'status',
      label: 'Status',
      accessor: (row) => row.status,
      render: (row) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {row.status}
        </span>
      ),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{registry?.label || collectionName}</h1>
          <p className="text-gray-500">Manage {registry?.label.toLowerCase() || collectionName}</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Add {registry?.singular || 'Item'}
        </Button>
      </div>
      <div className="card p-6">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : (
          <DataTable
            data={items}
            columns={columns}
            onEdit={openEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem?.id && items.find((i) => i.id === editingItem.id) ? `Edit ${registry?.singular}` : `Add ${registry?.singular}`} size="lg">
        <div className="space-y-4">
          {registry?.hasStatus && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingItem?.status || 'draft'}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, status: e.target.value }))}
                  className="select"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              {editingItem?.status === 'published' && (
                <Input
                  label="Published At"
                  type="datetime-local"
                  value={editingItem?.publishedAt ? editingItem.publishedAt.slice(0, 16) : ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                />
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registry?.fields?.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <FieldRenderer
                  field={field}
                  value={editingItem?.fields[field.name]}
                  onChange={(val) => updateField(field.name, val)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveItem} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
