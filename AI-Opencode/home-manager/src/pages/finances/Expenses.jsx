import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Filter, ChevronDown } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useModalScroll } from '../../hooks/useModalScroll';

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: '🏠 Housing', color: '#8b5cf6' },
  { value: 'utilities', label: '💡 Utilities', color: '#f59e0b' },
  { value: 'groceries', label: '🛒 Groceries', color: '#22c55e' },
  { value: 'transportation', label: '🚗 Transportation', color: '#3b82f6' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#ec4899' },
  { value: 'healthcare', label: '💊 Healthcare', color: '#ef4444' },
  { value: 'dining', label: '🍔 Dining', color: '#f97316' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#06b6d4' },
  { value: 'education', label: '📚 Education', color: '#6366f1' },
  { value: 'personal', label: '👤 Personal', color: '#64748b' },
  { value: 'other', label: '📦 Other', color: '#94a3b8' },
];

function Expenses() {
  const { expenses, loadAllData, addExpense, updateExpense, deleteExpense } = useFinanceStore();
  const { people, loadPeople } = usePeopleStore();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPerson, setFilterPerson] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'groceries',
    paidBy: '',
    splitWith: [],
    splitType: 'equal',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurringFrequency: 'monthly'
  });

  useModalScroll(showForm);

  useEffect(() => {
    loadAllData();
    loadPeople();
  }, [loadAllData, loadPeople]);

  // Set default paidBy when people load
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && people.length > 0 && !formData.paidBy) {
      initializedRef.current = true;
      setFormData(prev => ({ ...prev, paidBy: people[0].id.toString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.paidBy) return;

    const expenseData = {
      amount: parseFloat(formData.amount),
      category: formData.category,
      paidBy: formData.paidBy,
      splitWith: formData.splitWith,
      splitType: formData.splitType,
      date: new Date(formData.date),
      description: formData.description,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.recurringFrequency
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'groceries',
      paidBy: people[0]?.id || '',
      splitWith: [],
      splitType: 'equal',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isRecurring: false,
      recurringFrequency: 'monthly'
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      paidBy: expense.paid_by || expense.paidBy || '',
      splitWith: expense.splitWith || [],
      splitType: expense.splitType || 'equal',
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || '',
      isRecurring: expense.is_recurring || expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || 'monthly'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const toggleSplitPerson = (personId) => {
    setFormData(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(personId)
        ? prev.splitWith.filter(pid => pid !== personId)
        : [...prev.splitWith, personId]
    }));
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterCategory && expense.category !== filterCategory) return false;
    if (filterPerson && (expense.paid_by || expense.paidBy) !== filterPerson) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const getCategoryLabel = (value) => {
    return EXPENSE_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryColor = (value) => {
    return EXPENSE_CATEGORIES.find(c => c.value === value)?.color || '#94a3b8';
  };

  const getPersonName = (id) => {
    return people.find(p => p.id === id)?.name || 'Unknown';
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Expenses</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Track and manage household expenses
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input w-auto min-w-[150px]"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filterPerson}
          onChange={(e) => setFilterPerson(e.target.value)}
          className="input w-auto min-w-[150px]"
        >
          <option value="">All People</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </select>
        {(filterCategory || filterPerson) && (
          <button
            onClick={() => { setFilterCategory(''); setFilterPerson(''); }}
            className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">No expenses found</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: getCategoryColor(expense.category) }}
                >
                  {getCategoryLabel(expense.category).split(' ')[0]}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    £{expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {expense.description || getCategoryLabel(expense.category)} • {getPersonName(expense.paid_by || expense.paidBy)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(expense.date).toLocaleDateString()}
                    {expense.splitWith?.length > 0 && ` • Split ${expense.splitType}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(expense)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-danger transition-colors"
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
        <div
          className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto overscroll-contain"
          onClick={(e) => e.target === e.currentTarget && resetForm()}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-lg border border-[var(--border)] my-8 relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
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
                    Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input pl-12"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                      required
                    >
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Paid By *
                  </label>
                  <select
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select person</option>
                    {people.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>

                {/* Split With Section */}
                {people.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Split With
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {people.map(person => (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => toggleSplitPerson(person.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.splitWith.includes(person.id)
                            ? 'bg-primary text-white'
                            : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                          {person.name}
                        </button>
                      ))}
                    </div>
                    {formData.splitWith.length > 0 && (
                      <select
                        value={formData.splitType}
                        onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
                        className="input text-sm"
                      >
                        <option value="equal">Equal split</option>
                        <option value="percentage">Percentage</option>
                        <option value="amount">Exact amount</option>
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="What was this for?"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <label htmlFor="isRecurring" className="text-sm text-[var(--text-primary)]">
                    Recurring expense
                  </label>
                </div>

                {formData.isRecurring && (
                  <select
                    value={formData.recurringFrequency}
                    onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                    className="input"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}

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
                    {editingExpense ? 'Update' : 'Add'} Expense
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

export default Expenses;
