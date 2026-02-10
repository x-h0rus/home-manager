import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useModalScroll } from '../../hooks/useModalScroll';

function Income() {
  const { incomes, loadAllData, addIncome, updateIncome, deleteIncome } = useFinanceStore();
  const { people, loadPeople } = usePeopleStore();

  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    earnedBy: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const incomeData = {
      amount: parseFloat(formData.amount),
      source: formData.source,
      earnedBy: formData.earnedBy,
      date: new Date(formData.date),
      description: formData.description,
      isRecurring: formData.isRecurring
    };

    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, incomeData);
      } else {
        await addIncome(incomeData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      source: '',
      earnedBy: people[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isRecurring: false,
      recurringFrequency: 'monthly'
    });
    setEditingIncome(null);
    setShowForm(false);
  };

  const getPersonName = (id) => people.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Income</h2>
          <p className="text-[var(--text-secondary)] mt-1">Track your household income</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Income
        </button>
      </div>

      {incomes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)]">No income recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incomes.sort((a, b) => new Date(b.date) - new Date(a.date)).map((income) => (
            <div key={income.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-success">+£{income.amount.toFixed(2)}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {income.source} • {getPersonName(income.earned_by || income.earnedBy)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(income.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingIncome(income); setFormData({ amount: income.amount.toString(), source: income.source, earnedBy: income.earned_by || income.earnedBy || '', date: new Date(income.date).toISOString().split('T')[0], description: income.description || '', isRecurring: income.is_recurring || false, recurringFrequency: 'monthly' }); setShowForm(true); }} className="p-2 hover:bg-[var(--bg-dark)] rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteIncome(income.id)} className="p-2 hover:bg-[var(--bg-dark)] rounded text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">{editingIncome ? 'Edit' : 'Add'} Income</h3>
              <button onClick={resetForm}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input" placeholder="Amount" required />
              <input type="text" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} className="input" placeholder="Source (e.g., Salary)" required />
              <select value={formData.earnedBy} onChange={e => setFormData({ ...formData, earnedBy: e.target.value })} className="input" required>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="input" required />
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

export default Income;
