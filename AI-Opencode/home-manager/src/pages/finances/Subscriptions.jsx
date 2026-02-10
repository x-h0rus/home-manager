import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, CreditCard } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { useModalScroll } from '../../hooks/useModalScroll';

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', multiplier: 4.33 },
  { value: 'monthly', label: 'Monthly', multiplier: 1 },
  { value: 'quarterly', label: 'Quarterly', multiplier: 1/3 },
  { value: 'yearly', label: 'Yearly', multiplier: 1/12 },
];

function Subscriptions() {
  const { subscriptions, loadAllData, addSubscription, updateSubscription, deleteSubscription } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [formData, setFormData] = useState({
    name: '', amount: '', frequency: 'monthly', nextBillingDate: '', category: 'other', isActive: true
  });

  useModalScroll(showForm);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const monthlyTotal = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => {
      const freq = FREQUENCIES.find(f => f.value === s.frequency);
      return sum + (s.amount * (freq?.multiplier || 1));
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, amount: parseFloat(formData.amount) };
    if (editingSub) {
      await updateSubscription(editingSub.id, data);
    } else {
      await addSubscription(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', amount: '', frequency: 'monthly', nextBillingDate: '', category: 'other', isActive: true });
    setEditingSub(null);
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Subscriptions</h2>
          <p className="text-[var(--text-secondary)]">Track recurring payments and subscriptions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      <div className="card mb-6">
        <p className="text-sm text-[var(--text-secondary)]">Monthly Total</p>
        <p className="text-3xl font-bold text-[var(--text-primary)]">£{monthlyTotal.toFixed(2)}</p>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <div key={sub.id} className={`card flex items-center justify-between ${!sub.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{sub.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  £{sub.amount.toFixed(2)}/{sub.frequency} • Next: {new Date(sub.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setEditingSub(sub); setFormData({...sub, nextBillingDate: sub.nextBillingDate?.split('T')[0]}); setShowForm(true); }} 
                className="p-2 hover:bg-[var(--bg-dark)] rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteSubscription(sub.id)} className="p-2 hover:bg-[var(--bg-dark)] rounded text-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {subscriptions.length === 0 && (
          <div className="card text-center py-8 text-[var(--text-secondary)]">
            No subscriptions added yet
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">{editingSub ? 'Edit' : 'Add'} Subscription</h3>
              <button onClick={resetForm}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="Service name" required />
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="input" placeholder="Amount" required />
              <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="input">
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <input type="date" value={formData.nextBillingDate} onChange={e => setFormData({...formData, nextBillingDate: e.target.value})} className="input" required />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <label htmlFor="isActive">Active</label>
              </div>
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

export default Subscriptions;
