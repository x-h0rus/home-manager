import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Package, AlertTriangle, Search, ShoppingCart } from 'lucide-react';
import { useFoodStore } from '../../stores/foodStore';
import { useModalScroll } from '../../hooks/useModalScroll';

const CATEGORIES = [
  { value: 'produce', label: '🥬 Produce' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'meat', label: '🥩 Meat' },
  { value: 'bakery', label: '🍞 Bakery' },
  { value: 'frozen', label: '❄️ Frozen' },
  { value: 'pantry', label: '🥫 Pantry' },
  { value: 'beverages', label: '🥤 Beverages' },
  { value: 'snacks', label: '🍪 Snacks' },
  { value: 'household', label: '🧴 Household' },
  { value: 'other', label: '📦 Other' },
];

const LOCATIONS = ['pantry', 'fridge', 'freezer'];

function Pantry() {
  const { pantryItems, loadAllData, addPantryItem, deletePantryItem, addLowStockToList } = useFoodStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', quantity: 1, unit: 'pcs', category: 'pantry', location: 'pantry', expirationDate: '', minimumStock: ''
  });

  useModalScroll(showForm);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const filteredItems = pantryItems.filter(item => {
    if (activeTab !== 'all' && item.location !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getExpirationStatus = (date) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Expired', color: 'text-danger' };
    if (days <= 2) return { label: `${days} days`, color: 'text-danger' };
    if (days <= 7) return { label: `${days} days`, color: 'text-warning' };
    return null;
  };

  const expiringItems = pantryItems.filter(item => {
    if (!item.expirationDate) return false;
    const days = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  }).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

  const lowStockItems = pantryItems.filter(item => item.minimumStock && item.quantity < item.minimumStock);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addPantryItem(formData);
    setShowForm(false);
    setFormData({ name: '', quantity: 1, unit: 'pcs', category: 'pantry', location: 'pantry', expirationDate: '', minimumStock: '' });
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Pantry</h2>
          <p className="text-[var(--text-secondary)]">{pantryItems.length} items in inventory</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addLowStockToList} className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-dark)] flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Restock
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Alerts */}
      {expiringItems.length > 0 && (
        <div className="card mb-4 border-l-4 border-l-warning">
          <h3 className="font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Expiring Soon
          </h3>
          <div className="space-y-1">
            {expiringItems.slice(0, 3).map(item => (
              <p key={item.id} className="text-sm text-[var(--text-secondary)]">
                {item.name} - {getExpirationStatus(item.expirationDate)?.label}
              </p>
            ))}
          </div>
        </div>
      )}

      {lowStockItems.length > 0 && (
        <div className="card mb-4 border-l-4 border-l-danger">
          <h3 className="font-medium text-[var(--text-primary)] mb-2">Low Stock</h3>
          <div className="space-y-1">
            {lowStockItems.map(item => (
              <p key={item.id} className="text-sm text-[var(--text-secondary)]">
                {item.name} ({item.quantity} {item.unit} left, min: {item.minimumStock})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', ...LOCATIONS].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-primary text-white' 
                : 'bg-[var(--bg-dark)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab} ({tab === 'all' ? pantryItems.length : pantryItems.filter(i => i.location === tab).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input pl-10"
          placeholder="Search pantry items..."
        />
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const expStatus = getExpirationStatus(item.expirationDate);
          const isLow = item.minimumStock && item.quantity < item.minimumStock;
          return (
            <div key={item.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-dark)] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.quantity} {item.unit} • {item.location}
                    {expStatus && <span className={`ml-2 ${expStatus.color}`}>• {expStatus.label}</span>}
                    {isLow && <span className="ml-2 text-danger">• Low stock</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => deletePantryItem(item.id)} className="p-2 hover:bg-[var(--bg-dark)] rounded text-danger">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="card text-center py-8 text-[var(--text-secondary)]">
            No items found
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Add Pantry Item</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="Item name" required />
              <div className="flex gap-3">
                <input type="number" min="0" step="0.1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})} className="input" required />
                <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="input">
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                  <option value="L">L</option>
                  <option value="cans">cans</option>
                </select>
              </div>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input">
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="date" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="input" />
              <input type="number" min="0" value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: e.target.value})} className="input" placeholder="Minimum stock alert (optional)" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)]">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pantry;
