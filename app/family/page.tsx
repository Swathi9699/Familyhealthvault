import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVault } from '@/lib/vault-store';
import { FamilyMember, BloodType, RelationshipRole } from '@/types';
import {
  Users,
  Plus,
  Search,
  Heart,
  AlertTriangle,
  Phone,
  Building2,
  Edit2,
  Trash2,
  X,
  FileText,
  Pill,
  ShieldAlert,
} from 'lucide-react';
import { Link } from '@/lib/navigation';

const AVATAR_PALETTES = [
  { label: 'Teal', class: 'bg-teal-100 text-teal-800 border-teal-200' },
  { label: 'Sky', class: 'bg-sky-100 text-sky-800 border-sky-200' },
  { label: 'Amber', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Indigo', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { label: 'Rose', class: 'bg-rose-100 text-rose-800 border-rose-200' },
  { label: 'Emerald', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

export default function FamilyPage() {
  const { members, medications, documents, addMember, updateMember, deleteMember } = useVault();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Parent' as RelationshipRole,
    age: 30,
    dateOfBirth: '',
    bloodType: 'O+' as BloodType,
    allergies: '',
    chronicConditions: '',
    primaryPhysician: '',
    physicianPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    preferredHospital: '',
    notes: '',
    avatarColor: AVATAR_PALETTES[0].class,
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.allergies.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      member.chronicConditions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'parents'
        ? member.role === 'Parent' || member.role === 'Spouse'
        : roleFilter === 'children'
        ? member.role === 'Child'
        : member.role !== 'Parent' && member.role !== 'Child';

    return matchesSearch && matchesRole;
  });

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: 'Parent',
      age: 32,
      dateOfBirth: '',
      bloodType: 'O+',
      allergies: '',
      chronicConditions: '',
      primaryPhysician: '',
      physicianPhone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      preferredHospital: '',
      notes: '',
      avatarColor: AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)].class,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      age: member.age,
      dateOfBirth: member.dateOfBirth || '',
      bloodType: member.bloodType,
      allergies: member.allergies.join(', '),
      chronicConditions: member.chronicConditions.join(', '),
      primaryPhysician: member.primaryPhysician,
      physicianPhone: member.physicianPhone,
      emergencyContactName: member.emergencyContactName,
      emergencyContactPhone: member.emergencyContactPhone,
      emergencyContactRelation: member.emergencyContactRelation,
      preferredHospital: member.preferredHospital,
      notes: member.notes || '',
      avatarColor: member.avatarColor,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedAllergies = formData.allergies
      ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedConditions = formData.chronicConditions
      ? formData.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (editingMember) {
      updateMember(editingMember.id, {
        name: formData.name.trim(),
        role: formData.role,
        age: Number(formData.age),
        dateOfBirth: formData.dateOfBirth,
        bloodType: formData.bloodType,
        allergies: parsedAllergies,
        chronicConditions: parsedConditions,
        primaryPhysician: formData.primaryPhysician.trim(),
        physicianPhone: formData.physicianPhone.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim(),
        preferredHospital: formData.preferredHospital.trim(),
        notes: formData.notes.trim(),
        avatarColor: formData.avatarColor,
      });
    } else {
      addMember({
        name: formData.name.trim(),
        role: formData.role,
        age: Number(formData.age),
        dateOfBirth: formData.dateOfBirth,
        bloodType: formData.bloodType,
        allergies: parsedAllergies,
        chronicConditions: parsedConditions,
        primaryPhysician: formData.primaryPhysician.trim(),
        physicianPhone: formData.physicianPhone.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim(),
        preferredHospital: formData.preferredHospital.trim(),
        notes: formData.notes.trim(),
        avatarColor: formData.avatarColor,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your household vault? Associated medicines and appointment records will also be removed.`)) {
      deleteMember(id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Family Profiles"
        description="Organize individual medical records, critical allergies, blood types, and care circle contacts for everyone in your household."
        action={
          <Button onClick={openAddModal} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Family Member
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, allergy, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'parents', label: 'Parents' },
            { id: 'children', label: 'Children' },
            { id: 'others', label: 'Others' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                roleFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Family Profiles Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="text-center py-12 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No family profiles found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No members match "${searchQuery}". Try a different keyword.`
              : 'Add your family members to start managing household health records.'}
          </p>
          <Button onClick={openAddModal} variant="outline" size="sm">
            Add First Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMembers.map((member) => {
            const memberMeds = medications.filter((m) => m.memberId === member.id);
            const memberDocs = documents.filter((d) => d.memberId === member.id);

            return (
              <Card key={member.id} className="relative flex flex-col justify-between">
                <div>
                  {/* Card Header & Avatar */}
                  <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${member.avatarColor}`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 text-base">{member.name}</h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {member.bloodType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {member.role} · {member.age} years old
                          {member.dateOfBirth && ` (Born ${member.dateOfBirth})`}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Medical Details */}
                  <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                    {/* Allergies Notice */}
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Known Allergies</span>
                      </div>
                      {member.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.allergies.map((allergy, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80 font-medium text-xs"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No known drug or food allergies</span>
                      )}
                    </div>

                    {/* Chronic Conditions */}
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-teal-600" />
                        <span>Health Conditions</span>
                      </div>
                      {member.chronicConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.chronicConditions.map((condition, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200/80 text-xs"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No chronic diagnoses recorded</span>
                      )}
                    </div>

                    {/* Care Circle & Primary Doctor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <div className="text-slate-400 font-medium mb-0.5">Primary Physician</div>
                        <div className="font-medium text-slate-800">
                          {member.primaryPhysician || 'Not assigned'}
                        </div>
                        {member.physicianPhone && (
                          <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{member.physicianPhone}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-slate-400 font-medium mb-0.5">Emergency Contact</div>
                        <div className="font-medium text-slate-800">
                          {member.emergencyContactName || 'None listed'}
                          {member.emergencyContactRelation && ` (${member.emergencyContactRelation})`}
                        </div>
                        {member.emergencyContactPhone && (
                          <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{member.emergencyContactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferred Hospital */}
                    {member.preferredHospital && (
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Preferred Hospital: <strong>{member.preferredHospital}</strong></span>
                      </div>
                    )}

                    {/* Notes */}
                    {member.notes && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 italic">
                        "{member.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quick Links to Prescriptions & Documents */}
                <div className="p-3 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-amber-600" />
                      <strong>{memberMeds.length}</strong> active meds
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <strong>{memberDocs.length}</strong> records
                    </span>
                  </div>
                  <Link
                    href="/emergency"
                    className="text-rose-700 hover:text-rose-800 font-medium flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Emergency Card →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-900 text-lg">
                {editingMember ? 'Edit Family Profile' : 'Add New Family Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maya Vance"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role / Relationship</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as RelationshipRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Dependent">Dependent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as BloodType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Known Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Latex"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Chronic Health Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asthma, Hypertension, Celiac Disease"
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Primary Physician</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Sterling, MD"
                    value={formData.primaryPhysician}
                    onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Physician Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. (555) 234-8901"
                    value={formData.physicianPhone}
                    onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David Vance"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. (555) 432-1098"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Relation</label>
                  <input
                    type="text"
                    placeholder="e.g. Father / Spouse"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Preferred Hospital / Clinic</label>
                <input
                  type="text"
                  placeholder="e.g. Children's Regional Hospital"
                  value={formData.preferredHospital}
                  onChange={(e) => setFormData({ ...formData, preferredHospital: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Special Care Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Carries EpiPen in school bag; sensitive to cold weather."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Avatar color picker */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Avatar Color Theme</label>
                <div className="flex items-center gap-2">
                  {AVATAR_PALETTES.map((pal) => (
                    <button
                      key={pal.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarColor: pal.class })}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-transform ${pal.class} ${
                        formData.avatarColor === pal.class ? 'ring-2 ring-teal-600 scale-110' : ''
                      }`}
                    >
                      {formData.name ? formData.name.charAt(0) : 'A'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
