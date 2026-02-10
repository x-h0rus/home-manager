import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { useModalScroll } from '../../hooks/useModalScroll';

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'dining', label: 'Dining' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

function Budgets() {
  const { budgets, expenses, loadAllData, addBudget, updateBudget, deleteBudget } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({ category: '', amount: '', alertThreshold: 80 });

  useModalScroll(showForm);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const monthBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  const getSpent = (category) => {
    return expenses
      .filter(e => {
        const date = new Date(e.date);
        return e.category === category && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      month: currentMonth,
      year: currentYear,
      alertThreshold: parseInt(formData.alertThreshold)
    };
    if (editingBudget) {
      await updateBudget(editingBudget.id, data);
    } else {
      await addBudget(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ category: '', amount: '', alertThreshold: 80 });
    setEditingBudget(null);
    setShowForm(false);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Budgets</h2>
          <p className="text-[var(--text-secondary)]">Set and track spending limits by category</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Set Budget
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => { setCurrentMonth(m => m === 0 ? 11 : m - 1); if (currentMonth === 0) setCurrentYear(y => y - 1); }} className="p-2 rounded-lg hover:bg-[var(--bg-dark)]">←</button>
        <span className="text-lg font-semibold">{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={() => { setCurrentMonth(m => m === 11 ? 0 : m + 1); if (currentMonth === 11) setCurrentYear(y => y + 1); }} className="p-2 rounded-lg hover:bg-[var(--bg-dark)]">→</button>
      </div>

      <div className="space-y-4">
        {monthBudgets.map((budget) => {
          const spent = getSpent(budget.category);
          const percentage = Math.min((spent / budget.amount) * 100, 100);
          const isOver = spent > budget.amount;
          const isWarning = percentage >= budget.alertThreshold;

          return (
            <div key={budget.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{budget.category}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isOver ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'}`}>
                    £{spent.toFixed(2)} / £{budget.amount.toFixed(2)}
                  </span>
                  <button onClick={() => { setEditingBudget(budget); setFormData(budget); setShowForm(true); }} className="p-1 hover:bg-[var(--bg-dark)] rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteBudget(budget.id)} className="p-1 hover:bg-[var(--bg-dark)] rounded text-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-2 bg-[var(--bg-dark)] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isOver ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{percentage.toFixed(0)}% used</p>
            </div>
          );
        })}
        {monthBudgets.length === 0 && (
          <div className="card text-center py-8 text-[var(--text-secondary)]">
            No budgets set for this month
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">{editingBudget ? 'Edit' : 'Set'} Budget</h3>
              <button onClick={resetForm}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input" required>
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="input" placeholder="Budget amount" required />
              <div className="flex gap-3">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)]">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
