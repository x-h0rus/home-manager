import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Calendar, Package, ArrowRight, AlertCircle } from 'lucide-react';
import { useFoodStore } from '../../stores/foodStore';

function FoodOverview() {
  const { shoppingListItems, pantryItems, loadAllData, getExpiringItems, getLowStockItems } = useFoodStore();

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const expiringItems = getExpiringItems();
  const lowStockItems = getLowStockItems();
  const uncheckedItems = shoppingListItems.filter(i => !i.isPurchased);

  const quickLinks = [
    { to: '/food/shopping', label: 'Shopping List', icon: ShoppingCart, count: uncheckedItems.length, color: 'food' },
    { to: '/food/menu', label: 'Menu Planner', icon: Calendar, color: 'food' },
    { to: '/food/pantry', label: 'Pantry', icon: Package, count: pantryItems.length, color: 'food' },
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Food</h2>
        <p className="text-[var(--text-secondary)] mt-1">Meal planning, shopping lists, and pantry management</p>
      </div>

      {/* Alerts */}
      {(expiringItems.length > 0 || lowStockItems.length > 0) && (
        <div className="mb-6 space-y-3">
          {expiringItems.length > 0 && (
            <div className="card border-l-4 border-l-warning">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{expiringItems.length} items expiring soon</p>
                  <p className="text-sm text-[var(--text-secondary)]">Check your pantry for items about to expire</p>
                </div>
              </div>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="card border-l-4 border-l-danger">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-danger" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{lowStockItems.length} items running low</p>
                  <p className="text-sm text-[var(--text-secondary)]">Some pantry items are below minimum stock</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="card hover:border-food/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-${link.color}/10 flex items-center justify-center`}>
                  <link.icon className={`w-6 h-6 text-${link.color}`} />
                </div>
                <div>
                  <span className="font-medium text-[var(--text-primary)] block">{link.label}</span>
                  {link.count !== undefined && (
                    <span className="text-sm text-[var(--text-secondary)]">{link.count} items</span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-food transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default FoodOverview;
