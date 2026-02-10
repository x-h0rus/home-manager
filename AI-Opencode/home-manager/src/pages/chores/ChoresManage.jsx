import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { useChoresStore } from '../../stores/choresStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { format } from 'date-fns';

const ROOMS = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Dining Room', 'Laundry', 'Garage', 'Yard', 'Office', 'General'];
const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

function ChoresManage() {
  const { chores, loadAllData, addChore, updateChore, deleteChore, error: storeError } = useChoresStore();
  const { people, loadPeople } = usePeopleStore();
  const [showForm, setShowForm] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room: 'General',
    frequencyType: 'weekly',
    frequencyDaysOfWeek: [1],
    frequencyCustomDays: 7,
    assignedTo: [],
    rotationType: 'fixed',
    priority: 'medium',
    estimatedMinutes: '',
    nextDue: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAllData();
    loadPeople();
  }, [loadAllData, loadPeople]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Chore name is required');
      return;
    }

    if (formData.assignedTo.length === 0) {
      setError('Please assign at least one person');
      return;
    }

    setIsSubmitting(true);

    try {
      const frequency = {
        type: formData.frequencyType,
        daysOfWeek: formData.frequencyType === 'weekly' ? formData.frequencyDaysOfWeek : undefined,
        customDays: formData.frequencyType === 'custom' ? parseInt(formData.frequencyCustomDays) || 7 : undefined
      };

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        room: formData.room,
        frequency,
        assignedTo: formData.assignedTo,
        rotationType: formData.rotationType,
        priority: formData.priority,
        estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : null,
        nextDue: new Date(formData.nextDue)
      };

      if (editingChore) {
        await updateChore(editingChore.id, data);
      } else {
        await addChore(data);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving chore:', err);
      setError(err.message || 'Failed to save chore. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      room: 'General',
      frequencyType: 'weekly',
      frequencyDaysOfWeek: [1],
      frequencyCustomDays: 7,
      assignedTo: [],
      rotationType: 'fixed',
      priority: 'medium',
      estimatedMinutes: '',
      nextDue: new Date().toISOString().split('T')[0]
    });
    setEditingChore(null);
    setError(null);
    setShowForm(false);
  };

  const toggleDayOfWeek = (day) => {
    const current = formData.frequencyDaysOfWeek;
    setFormData({
      ...formData,
      frequencyDaysOfWeek: current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day].sort((a, b) => a - b)
    });
  };

  const toggleAssignee = (personId) => {
    const current = formData.assignedTo;
    setFormData({
      ...formData,
      assignedTo: current.includes(personId)
        ? current.filter(id => id !== personId)
        : [...current, personId]
    });
  };

  const getPersonName = (id) => people.find(p => p.id === id)?.name || 'Unknown';

  const handleEdit = (chore) => {
    setEditingChore(chore);
    const frequency = typeof chore.frequency === 'string'
      ? (() => { try { return JSON.parse(chore.frequency); } catch { return { type: 'weekly' }; } })()
      : chore.frequency || { type: 'weekly' };
    setFormData({
      name: chore.name || '',
      description: '',
      room: 'General',
      frequencyType: frequency.type || 'weekly',
      frequencyDaysOfWeek: frequency.daysOfWeek || [1],
      frequencyCustomDays: frequency.customDays || 7,
      assignedTo: chore.assigned_to ? [chore.assigned_to] : [],
      rotationType: 'fixed',
      priority: chore.priority || 'medium',
      estimatedMinutes: '',
      nextDue: chore.next_due ? new Date(chore.next_due).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/chores" className="p-2 hover:bg-[var(--bg-dark)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Manage Chores</h2>
            <p className="text-[var(--text-secondary)] mt-1">{chores.length} chores configured</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4" /> Add Chore
        </button>
      </div>

      {(error || storeError) && (
        <div className="card mb-4 border-l-4 border-l-danger bg-danger/5">
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            <span>{error || storeError}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {chores.map(chore => (
          <div key={chore.id} className={`card flex items-center justify-between ${!chore.isActive ? 'opacity-50' : ''}`}>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{chore.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {chore.frequency?.type || 'weekly'} • Next: {format(new Date(chore.next_due), 'MMM d')}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Assigned: {chore.assigned_to ? getPersonName(chore.assigned_to) : 'Unassigned'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(chore)}
                className="p-2 hover:bg-[var(--bg-dark)] rounded"
                disabled={isSubmitting}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete this chore?')) {
                    deleteChore(chore.id);
                  }
                }}
                className="p-2 hover:bg-[var(--bg-dark)] rounded text-danger"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {chores.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-[var(--text-secondary)] mb-4">No chores yet. Create your first chore!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-2" /> Add First Chore
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto overscroll-contain"
          onClick={(e) => e.target === e.currentTarget && resetForm()}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-lg border border-[var(--border)] my-8 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {editingChore ? 'Edit Chore' : 'Add New Chore'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-[var(--bg-dark)] rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Chore Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Vacuum Living Room"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="Optional details..."
                    rows="2"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Room</label>
                    <select
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      className="input"
                      disabled={isSubmitting}
                    >
                      {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Frequency</label>
                    <select
                      value={formData.frequencyType}
                      onChange={e => setFormData({ ...formData, frequencyType: e.target.value })}
                      className="input"
                      disabled={isSubmitting}
                    >
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>

                {formData.frequencyType === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Days of week *
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDayOfWeek(idx)}
                          disabled={isSubmitting}
                          className={`w-12 h-10 rounded-lg font-medium text-sm transition-colors ${formData.frequencyDaysOfWeek.includes(idx)
                            ? 'bg-primary text-white'
                            : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {formData.frequencyDaysOfWeek.length === 0 && (
                      <p className="text-xs text-danger mt-1">Select at least one day</p>
                    )}
                  </div>
                )}

                {formData.frequencyType === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Repeat every (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.frequencyCustomDays}
                      onChange={e => setFormData({ ...formData, frequencyCustomDays: e.target.value })}
                      className="input"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Assigned to *
                  </label>
                  {people.length === 0 ? (
                    <p className="text-sm text-warning">Please add people first in the People section</p>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {people.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleAssignee(p.id)}
                          disabled={isSubmitting}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.assignedTo.includes(p.id)
                            ? 'bg-primary text-white'
                            : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      className="input w-full"
                      disabled={isSubmitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Est. Min</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.estimatedMinutes}
                      onChange={e => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                      className="input w-full appearance-none"
                      placeholder="15"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Next Due *</label>
                    <input
                      type="date"
                      value={formData.nextDue}
                      onChange={e => setFormData({ ...formData, nextDue: e.target.value })}
                      className="input w-full"
                      style={{ minWidth: 0 }}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-dark)] transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary disabled:opacity-50"
                    disabled={isSubmitting || formData.assignedTo.length === 0}
                  >
                    {isSubmitting ? 'Saving...' : (editingChore ? 'Update' : 'Add')} Chore
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChoresManage;
