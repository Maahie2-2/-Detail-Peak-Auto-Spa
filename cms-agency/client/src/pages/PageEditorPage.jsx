import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Toggle } from '../components/ui';
import { Modal } from '../components/Modal';
import { ImagePicker } from '../components/ImagePicker';
import { RelationPicker } from '../components/RelationPicker';
import { sectionRegistry, getSectionDefaults } from '../config/sections';
import { addGlobalToast } from '../components/Modal';

function generateId() {
  return 'sec-' + Math.random().toString(36).substring(2, 9);
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
    case 'boolean':
      return <Toggle label={field.label} checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    case 'image':
      return <ImagePicker label={field.label} value={value} onChange={onChange} multiple={field.multiple} />;
    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="select"
        >
          <option value="">Select...</option>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case 'relation':
      return <RelationPicker label={field.label} value={value} onChange={onChange} collection={field.collection} multiple={field.multiple} />;
    case 'color':
      return (
        <div className="flex items-center gap-3">
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded" />
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1" />
        </div>
      );
    case 'date':
      return <Input type="date" label={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    default:
      return <Input label={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

export default function PageEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [collections, setCollections] = useState({});
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPage(data.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    // Fetch all collections for preview
    Promise.all([
      fetch('/api/collections/services').then(r => r.json()),
      fetch('/api/collections/testimonials').then(r => r.json()),
      fetch('/api/collections/faqs').then(r => r.json()),
      fetch('/api/collections/packages').then(r => r.json()),
      fetch('/api/collections/vehicles').then(r => r.json()),
      fetch('/api/settings/business').then(r => r.json()),
      fetch('/api/settings/seo').then(r => r.json()),
    ]).then(([svc, tst, faq, pkg, veh, biz, seo]) => {
      setCollections({
        services: svc.data?.items || [],
        testimonials: tst.data?.items || [],
        faqs: faq.data?.items || [],
        packages: pkg.data?.items || [],
        vehicles: veh.data?.items || [],
      });
      setSettings({ business: biz.data, seo: seo.data });
    }).catch(() => {
      // silently fail for preview
    });
  }, []);

  const updateSectionField = (sectionId, fieldName, value) => {
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, fields: { ...sec.fields, [fieldName]: value } } : sec
      ),
    }));
  };

  const addSection = (type) => {
    const newSection = {
      id: generateId(),
      type,
      fields: getSectionDefaults(type),
    };
    setPage((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setAddModalOpen(false);
  };

  const removeSection = (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.filter((sec) => sec.id !== sectionId),
    }));
  };

  const duplicateSection = (sectionId) => {
    setPage((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const section = prev.sections[idx];
      const clone = { ...section, id: generateId() };
      const sections = [...prev.sections];
      sections.splice(idx + 1, 0, clone);
      return { ...prev, sections };
    });
  };

  const moveSection = (sectionId, direction) => {
    setPage((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
      return { ...prev, sections };
    });
  };

  const updateMeta = (field, value) => {
    setPage((prev) => ({
      ...prev,
      meta: { ...prev.meta, [field]: value },
    }));
  };

  const updateOg = (field, value) => {
    setPage((prev) => ({
      ...prev,
      meta: { ...prev.meta, og: { ...prev.meta.og, [field]: value } },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });
      const data = await res.json();
      if (data.success) {
        addGlobalToast('Page saved successfully');
      } else {
        addGlobalToast(data.message || 'Save failed', 'error');
      }
    } catch (e) {
      addGlobalToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(window.location.origin, '_blank');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!page) return <div className="p-8 text-center text-red-500">Page not found</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit {page.title || page.slug}</h1>
          <p className="text-gray-500">Page: {page.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handlePreview}>Preview</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Page'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {['content', 'preview', 'seo'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Page Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Page Title" value={page.title || ''} onChange={(e) => setPage({ ...page, title: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Sections</h2>
            <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
              + Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {page.sections.map((section, index) => {
              const registry = sectionRegistry[section.type];
              return (
                <div key={section.id} className="card overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#{index + 1}</span>
                      <h3 className="font-semibold text-gray-900">{registry?.label || section.type}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveSection(section.id, -1)} disabled={index === 0} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button onClick={() => moveSection(section.id, 1)} disabled={index === page.sections.length - 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded hover:bg-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button onClick={() => duplicateSection(section.id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-200" title="Duplicate">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                      <button onClick={() => removeSection(section.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-200" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registry?.fields?.map((field) => (
                      <div key={field.name} className={field.type === 'textarea' || field.type === 'relation' ? 'md:col-span-2' : ''}>
                        <FieldRenderer
                          field={field}
                          value={section.fields[field.name]}
                          onChange={(val) => updateSectionField(section.id, field.name, val)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {page.sections.length === 0 && (
              <div className="card p-12 text-center">
                <p className="text-gray-500 mb-4">This page has no sections yet.</p>
                <Button variant="primary" onClick={() => setAddModalOpen(true)}>Add Your First Section</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Website Preview</h2>
            <div className="space-y-4">
              {page.sections.map((section) => {
                const registry = sectionRegistry[section.type];
                const f = section.fields;
                return (
                  <div key={section.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase text-gray-400">{registry?.label || section.type}</span>
                    </div>
                    {f.heading && <h3 className="text-xl font-bold mb-1">{f.heading}</h3>}
                    {f.subheading && <p className="text-gray-300 text-sm">{f.subheading}</p>}
                    {f.description && <p className="text-gray-300 text-sm">{f.description}</p>}
                    {f.buttonText && <span className="inline-block mt-2 px-4 py-1 bg-blue-600 rounded-full text-sm">{f.buttonText}</span>}
                    {f.selectedServices && f.selectedServices.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {f.selectedServices.map((id) => {
                          const svc = collections.services?.find((s) => s.id === id);
                          return svc ? <p key={id} className="text-sm text-gray-300">• {svc.fields.title}</p> : null;
                        })}
                      </div>
                    )}
                    {f.testimonialIds && f.testimonialIds.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {f.testimonialIds.map((id) => {
                          const t = collections.testimonials?.find((x) => x.id === id);
                          return t ? (
                            <div key={id} className="bg-gray-700 rounded p-2 text-sm">
                              <p className="text-gray-200 italic">"{t.fields.quote?.substring(0, 80)}..."</p>
                              <p className="text-gray-400 text-xs mt-1">— {t.fields.name}</p>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    {f.faqIds && f.faqIds.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {f.faqIds.map((id) => {
                          const q = collections.faqs?.find((x) => x.id === id);
                          return q ? <p key={id} className="text-sm text-gray-300">Q: {q.fields.question}</p> : null;
                        })}
                      </div>
                    )}
                    {f.packagesIds && f.packagesIds.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {f.packagesIds.map((id) => {
                          const p = collections.packages?.find((x) => x.id === id);
                          return p ? <p key={id} className="text-sm text-gray-300">📦 {p.fields.title} — {p.fields.price || 'Contact for pricing'}</p> : null;
                        })}
                      </div>
                    )}
                    {f.vehiclesIds && f.vehiclesIds.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {f.vehiclesIds.map((id) => {
                          const v = collections.vehicles?.find((x) => x.id === id);
                          return v ? <span key={id} className="bg-gray-700 px-2 py-1 rounded text-xs">{v.fields.name}</span> : null;
                        })}
                      </div>
                    )}
                    {f.image && (
                      <div className="mt-2">
                        <img src={f.image} alt="" className="max-h-32 rounded object-cover" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Business Info</h3>
              <p className="text-sm text-gray-600">Name: {settings.business?.name || '—'}</p>
              <p className="text-sm text-gray-600">Phone: {settings.business?.phone || '—'}</p>
              <p className="text-sm text-gray-600">Email: {settings.business?.email || '—'}</p>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">All Collections</h3>
              <p className="text-sm text-gray-600">Services: {collections.services?.length || 0}</p>
              <p className="text-sm text-gray-600">Testimonials: {collections.testimonials?.length || 0}</p>
              <p className="text-sm text-gray-600">Packages: {collections.packages?.length || 0}</p>
              <p className="text-sm text-gray-600">Vehicles: {collections.vehicles?.length || 0}</p>
              <p className="text-sm text-gray-600">FAQs: {collections.faqs?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Meta Tags</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Meta Title" value={page.meta?.title || ''} onChange={(e) => updateMeta('title', e.target.value)} />
              <Input label="Canonical URL" value={page.meta?.canonical || ''} onChange={(e) => updateMeta('canonical', e.target.value)} />
              <Textarea label="Meta Description" value={page.meta?.description || ''} onChange={(e) => updateMeta('description', e.target.value)} className="md:col-span-2" />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Open Graph</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="OG Title" value={page.meta?.og?.title || ''} onChange={(e) => updateOg('title', e.target.value)} />
              <Input label="OG Description" value={page.meta?.og?.description || ''} onChange={(e) => updateOg('description', e.target.value)} />
              <Input label="OG Image URL" value={page.meta?.og?.image || ''} onChange={(e) => updateOg('image', e.target.value)} className="md:col-span-2" />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Schema Markup</h2>
            <Textarea label="JSON-LD Schema" value={page.meta?.schema || ''} onChange={(e) => updateMeta('schema', e.target.value)} rows={8} />
            <p className="text-xs text-gray-500 mt-2">Paste raw JSON-LD schema markup here.</p>
          </div>
        </div>
      )}

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Section" size="md">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(sectionRegistry).map(([type, config]) => (
            <button
              key={type}
              onClick={() => addSection(type)}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 text-left transition-colors"
            >
              <p className="font-medium text-gray-900">{config.label}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{type}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
