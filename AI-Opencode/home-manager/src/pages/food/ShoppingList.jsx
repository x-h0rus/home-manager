import { useState, useEffect } from 'react';
import { Plus, Trash2, X, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useFoodStore } from '../../stores/foodStore';
import { useModalScroll } from '../../hooks/useModalScroll';

const CATEGORIES = [
  { value: 'produce', label: '🥬 Produce', icon: '🥬' },
  { value: 'dairy', label: '🥛 Dairy', icon: '🥛' },
  { value: 'meat', label: '🥩 Meat', icon: '🥩' },
  { value: 'bakery', label: '🍞 Bakery', icon: '🍞' },
  { value: 'frozen', label: '❄️ Frozen', icon: '❄️' },
  { value: 'pantry', label: '🥫 Pantry', icon: '🥫' },
  { value: 'beverages', label: '🥤 Beverages', icon: '🥤' },
  { value: 'snacks', label: '🍪 Snacks', icon: '🍪' },
  { value: 'household', label: '🧴 Household', icon: '🧴' },
  { value: 'other', label: '📦 Other', icon: '📦' },
];

function ShoppingList() {
  const { shoppingListItems, loadAllData, addShoppingItem, updateShoppingItem, deleteShoppingItem, clearCheckedItems, moveCheckedToPantry, error } = useFoodStore();
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', quantity: 1, unit: 'pcs', category: 'produce' });
  const [formError, setFormError] = useState(null);

  useModalScroll(showForm);

  useEffect(() => { 
    loadAllData(); 
  }, [loadAllData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.name.trim()) {
      setFormError('Item name is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await addShoppingItem(formData);
      setFormData({ name: '', quantity: 1, unit: 'pcs', category: 'produce' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = async (item) => {
    try {
      await updateShoppingItem(item.id, { isPurchased: !item.isPurchased });
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const handleClearChecked = async () => {
    setIsLoading(true);
    try {
      await clearCheckedItems();
    } catch (err) {
      console.error('Error clearing items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToPantry = async () => {
    setIsLoading(true);
    try {
      await moveCheckedToPantry();
    } catch (err) {
      console.error('Error moving to pantry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteShoppingItem(itemId);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const itemsByCategory = CATEGORIES.map(cat => ({
    ...cat,
    items: shoppingListItems.filter(item => item.category === cat.value)
  })).filter(cat => cat.items.length > 0);

  const checkedCount = shoppingListItems.filter(i => i.isPurchased === true || i.isPurchased === 1).length;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Shopping List</h2>
          <p className="text-[var(--text-secondary)] mt-1">{shoppingListItems.length} items • {checkedCount} checked</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {(error || formError) && (
        <div className="card mb-4 border-l-4 border-l-danger bg-danger/5">
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            <span>{error || formError}</span>
          </div>
        </div>
      )}

      {shoppingListItems.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-primary)] font-medium mb-2">Your shopping list is empty</p>
          <p className="text-[var(--text-secondary)] text-sm mb-4">Add items to start shopping</p>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {itemsByCategory.map((category) => (
              <div key={category.value}>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <span>{category.icon}</span> {category.label}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`card py-3 flex items-center justify-between ${item.isPurchased ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleItem(item)}
                          disabled={isLoading}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.isPurchased 
                              ? 'bg-success border-success text-white' 
                              : 'border-[var(--border)] hover:border-primary'
                          }`}
                        >
                          {item.isPurchased && <Check className="w-4 h-4" />}
                        </button>
                        <div>
                          <span className={`${item.isPurchased ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                            {item.name}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)] ml-2">
                            ({item.quantity} {item.unit})
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        disabled={isLoading}
                        className="p-2 hover:bg-[var(--bg-dark)] rounded text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {checkedCount > 0 && (
            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleClearChecked} 
                disabled={isLoading}
                className="flex-1 py-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-dark)] transition-colors disabled:opacity-50"
              >
                Clear Checked ({checkedCount})
              </button>
              <button 
                onClick={handleMoveToPantry} 
                disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Moving...' : `Add ${checkedCount} Item${checkedCount > 1 ? 's' : ''} to Pantry`}
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Add Item</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Item Name *
                </label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="input" 
                  placeholder="e.g., Milk, Bread, Eggs"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex gap-3">
                <div className="w-24">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Quantity
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} 
                    className="input" 
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Unit
                  </label>
                  <select 
                    value={formData.unit} 
                    onChange={e => setFormData({...formData, unit: e.target.value})} 
                    className="input"
                    disabled={isLoading}
                  >
                    <option value="pcs">pieces</option>
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="L">liters</option>
                    <option value="gal">gallons</option>
                    <option value="cans">cans</option>
                    <option value="boxes">boxes</option>
                    <option value="bags">bags</option>
                    <option value="bottles">bottles</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Category
                </label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="input"
                  disabled={isLoading}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-dark)] transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingList;
