import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, User } from 'lucide-react';
import { usePeopleStore } from '../stores/peopleStore';
import { useModalScroll } from '../hooks/useModalScroll';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#78716c', '#475569'
];

function People() {
  const { people, loading, loadPeople, addPerson, updatePerson, deletePerson } = usePeopleStore();
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0],
    avatar: ''
  });

  useModalScroll(showForm);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingPerson) {
        await updatePerson(editingPerson.id, formData);
      } else {
        await addPerson(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', color: PRESET_COLORS[0], avatar: '' });
    setEditingPerson(null);
    setShowForm(false);
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      color: person.color,
      avatar: person.avatar || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      await deletePerson(id);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">People</h2>
          <p className="text-[var(--text-secondary)] mt-1 text-base">
            Manage household members for expense tracking and chore assignments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Person
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">Loading...</div>
      ) : people.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No people added yet</h3>
          <p className="text-[var(--text-secondary)] mb-4">Add household members to track expenses and assign chores</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Person
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <div key={person.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: person.color }}
                >
                  {person.avatar || person.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{person.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Member</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(person)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={`Edit ${person.name}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(person.id)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-danger transition-colors"
                  aria-label={`Delete ${person.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {editingPerson ? 'Edit Person' : 'Add Person'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-[var(--bg-dark)] text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Color
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Avatar (optional)
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="input"
                  placeholder="Emoji or letter (e.g., 👨 or J)"
                  maxLength={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-dark)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingPerson ? 'Update' : 'Add'} Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default People;
