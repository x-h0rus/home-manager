import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  CheckSquare,
  Users,
  PoundSterling
} from 'lucide-react';

function Navigation() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/finances', icon: PoundSterling, label: 'Finance' },
    { to: '/food', icon: ShoppingCart, label: 'Food' },
    { to: '/chores/manage', icon: CheckSquare, label: 'Chores' },
    { to: '/people', icon: Users, label: 'People' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive
                  ? 'text-primary'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-[73px] bottom-0 w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex-col py-6 px-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-dark)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop content offset */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
}

export default Navigation;
