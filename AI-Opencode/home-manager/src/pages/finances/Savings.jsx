import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Target } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useModalScroll } from '../../hooks/useModalScroll';

function Savings() {
  const { savingsGoals, loadAllData, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addContribution } = useFinanceStore();
  const { people, loadPeople } = usePeopleStore();
  const [showForm, setShowForm] = useState(false);
  const [showContribute, setShowContribute] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ name: '', targetAmount: '', currentAmount: 0, deadline: '', color: '#6366f1' });
  const [contribution, setContribution] = useState({ amount: '', contributedBy: '' });

  useModalScroll(showForm);
  useModalScroll(showContribute);

  useEffect(() => { loadAllData(); loadPeople(); }, [loadAllData, loadPeople]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, targetAmount: parseFloat(formData.targetAmount) };
    if (editingGoal) {
      await updateSavingsGoal(editingGoal.id, data);
    } else {
      await addSavingsGoal(data);
    }
    resetForm();
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    await addContribution(showContribute.id, {
      amount: parseFloat(contribution.amount),
      contributedBy: parseInt(contribution.contributedBy),
      date: new Date()
    });
    setShowContribute(null);
    setContribution({ amount: '', contributedBy: '' });
  };

  const resetForm = () => {
    setFormData({ name: '', targetAmount: '', currentAmount: 0, deadline: '', color: '#6366f1' });
    setEditingGoal(null);
    setShowForm(false);
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'];

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Savings Goals</h2>
          <p className="text-[var(--text-secondary)]">Track progress toward your financial goals</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <div key={goal.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: goal.color + '20' }}>
                    <Target className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{goal.name}</h3>
                    {goal.deadline && <p className="text-xs text-[var(--text-secondary)]">Due: {new Date(goal.deadline).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingGoal(goal); setFormData(goal); setShowForm(true); }} className="p-1 hover:bg-[var(--bg-dark)] rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteSavingsGoal(goal.id)} className="p-1 hover:bg-[var(--bg-dark)] rounded text-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">Progress</span>
                  <span className="font-semibold">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-[var(--bg-dark)] rounded-full overflow-hidden">
                  <div className="h-full transition-all rounded-full" style={{ width: `${percentage}%`, backgroundColor: goal.color }} />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  £{goal.currentAmount.toFixed(2)} of £{goal.targetAmount.toFixed(2)}
                </p>
              </div>

              <button onClick={() => setShowContribute(goal)} className="w-full py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-dark)] transition-colors text-sm">
                Add Contribution
              </button>
            </div>
          );
        })}
      </div>

      {savingsGoals.length === 0 && (
        <div className="card text-center py-12">
          <Target className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No savings goals yet</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">{editingGoal ? 'Edit' : 'Create'} Goal</h3>
              <button onClick={resetForm}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="Goal name" required />
              <input type="number" step="0.01" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} className="input" placeholder="Target amount" required />
              <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="input" />
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full ${formData.color === c ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)]">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContribute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4">Contribute to {showContribute.name}</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <input type="number" step="0.01" value={contribution.amount} onChange={e => setContribution({...contribution, amount: e.target.value})} className="input" placeholder="Amount" required />
              <select value={contribution.contributedBy} onChange={e => setContribution({...contribution, contributedBy: e.target.value})} className="input" required>
                <option value="">Select person</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowContribute(null)} className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)]">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Contribute</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Savings;
