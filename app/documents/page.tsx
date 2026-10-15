import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import { HealthDocument, DocumentCategory } from '@/types';
import {
  FileText,
  Plus,
  Search,
  FileCheck,
  Download,
  Trash2,
  X,
  Tag,
  Building2,
  Calendar,
  Eye,
  Filter,
} from 'lucide-react';

const CATEGORIES: DocumentCategory[] = [
  'Lab Report',
  'Immunization',
  'Prescription',
  'Clinical Note',
  'Insurance',
  'Radiology',
  'Discharge Summary',
];

export default function DocumentsPage() {
  const { members, documents, addDocument, deleteDocument } = useVault();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Lab Report' as DocumentCategory,
    memberId: members[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    fileType: 'PDF',
    size: '1.2 MB',
    summary: '',
    tags: '',
  });

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesMember = memberFilter === 'all' || doc.memberId === memberFilter;

    return matchesSearch && matchesCategory && matchesMember;
  });

  const openAddModal = () => {
    setFormData({
      title: '',
      category: 'Lab Report',
      memberId: members[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      provider: 'Evergreen Health Diagnostic Lab',
      fileType: 'PDF',
      size: '1.4 MB',
      summary: '',
      tags: 'Routine, Lab',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.memberId) return;

    const parsedTags = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    addDocument({
      title: formData.title.trim(),
      category: formData.category,
      memberId: formData.memberId,
      date: formData.date,
      provider: formData.provider.trim(),
      fileType: formData.fileType,
      size: formData.size,
      summary: formData.summary.trim(),
      tags: parsedTags,
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove document "${title}"?`)) {
      deleteDocument(id);
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Health Documents & Records"
        description="A secure household archive for lab tests, immunization records, school health forms, and insurance policies."
        action={
          <Button onClick={openAddModal} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Document Record
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, lab findings, diagnostic provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Member Filter */}
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">All Family Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid / List */}
      {filteredDocs.length === 0 ? (
        <Card className="text-center py-12 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No documents found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No records match "${searchQuery}".`
              : 'Add your vaccine records, lab panels, or dentist reports to start your household vault.'}
          </p>
          <Button onClick={openAddModal} variant="outline" size="sm">
            Add First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            return (
              <Card
                key={doc.id}
                className="p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 shrink-0 mt-0.5">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                          {doc.category}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug mt-0.5">
                          {doc.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-slate-700">{doc.familyMemberName}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary */}
                  {doc.summary && (
                    <p className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 mt-3 leading-relaxed">
                      {doc.summary}
                    </p>
                  )}

                  {/* Provider & Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500">
                    {doc.provider && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {doc.provider}
                      </span>
                    )}
                    {doc.tags && doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-xs">
                  <span className="font-mono text-slate-400">
                    {doc.fileType} · {doc.size}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setSelectedDoc(doc)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-teal-700"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  {selectedDoc.category}
                </span>
                <h3 className="font-semibold text-slate-900 text-lg mt-0.5">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block">Family Member</span>
                  <strong className="text-slate-900">{selectedDoc.familyMemberName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Record Date</span>
                  <strong className="text-slate-900">{selectedDoc.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Clinic / Lab Facility</span>
                  <strong className="text-slate-900">{selectedDoc.provider}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">File Details</span>
                  <strong className="text-slate-900">{selectedDoc.fileType} ({selectedDoc.size})</strong>
                </div>
              </div>

              {selectedDoc.summary && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-semibold text-slate-700 text-xs mb-1">
                    Findings & Clinical Notes:
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">{selectedDoc.summary}</p>
                </div>
              )}

              {downloadNotice && (
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center justify-between">
                  <span>{downloadNotice}</span>
                  <button
                    onClick={() => setDownloadNotice(null)}
                    className="text-teal-600 hover:text-teal-800 text-[11px] font-medium ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedDoc.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDoc(null);
                  setDownloadNotice(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDownloadNotice(`Simulated download for "${selectedDoc.title}" (${selectedDoc.fileType}). Synthetic demo report verified.`);
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Download Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-900 text-lg">Add Health Document Record</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Bloodwork CMP & Lipid Panel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Family Member *
                  </label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as DocumentCategory })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Record Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Clinic / Diagnostic Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quest Diagnostics"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Summary Findings / Doctor Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fasting glucose normal (92 mg/dL), Cholesterol within target range."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Labs, Bloodwork, Annual Checkup"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                📄 Attachment: Simulated document vault file ({formData.fileType}, {formData.size}).
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Document Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
