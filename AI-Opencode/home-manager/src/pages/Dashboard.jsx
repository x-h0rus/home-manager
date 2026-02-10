import { useEffect, useMemo } from 'react';
import {
  PoundSterling,
  ShoppingCart,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePeopleStore } from '../stores/peopleStore';
import { useFinanceStore } from '../stores/financeStore';
import { useFoodStore } from '../stores/foodStore';
import { useChoresStore } from '../stores/choresStore';
import { startOfDay, startOfWeek, addDays, format, isSameDay } from 'date-fns';

const SHOPPING_CATEGORIES = [
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

function Dashboard() {
  const { people, loadPeople } = usePeopleStore();
  const { expenses, incomes, loadAllData: loadFinance } = useFinanceStore();
  const { shoppingListItems, loadAllData: loadFood, getExpiringItems, getLowStockItems } = useFoodStore();
  const { chores, loadAllData: loadChores } = useChoresStore();

  useEffect(() => {
    loadPeople();
    loadFinance();
    loadFood();
    loadChores();
  }, [loadPeople, loadFinance, loadFood, loadChores]);

  const now = useMemo(() => new Date(), []);
  const today = startOfDay(now);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate stats
  const monthlyExpenses = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyIncome = incomes
    .filter(i => {
      const date = new Date(i.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, i) => sum + i.amount, 0);

  // Finance chart data - daily breakdown for this month
  const financeChartData = useMemo(() => {
    const data = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
      const dayExpenses = expenses
        .filter(e => {
          const eDate = new Date(e.date);
          return eDate.getDate() === day &&
            eDate.getMonth() === currentMonth &&
            eDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const dayIncome = incomes
        .filter(i => {
          const iDate = new Date(i.date);
          return iDate.getDate() === day &&
            iDate.getMonth() === currentMonth &&
            iDate.getFullYear() === currentYear;
        })
        .reduce((sum, i) => sum + i.amount, 0);

      if (dayExpenses > 0 || dayIncome > 0) {
        data.push({
          day: day.toString(),
          expenses: dayExpenses,
          income: dayIncome
        });
      }
    }

    // If no data, show at least one entry
    if (data.length === 0) {
      data.push({ day: '1', expenses: 0, income: 0 });
    }

    return data;
  }, [expenses, incomes, currentMonth, currentYear, now]);

  const uncheckedItems = shoppingListItems.filter(i => !i.is_purchased);
  const dueChores = chores.filter(chore => {
    const nextDue = new Date(chore.next_due);
    return nextDue <= today;
  });

  const expiringItems = getExpiringItems();
  const lowStockItems = getLowStockItems();

  // Weekly chores data
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getChoresForDay = (date) => {
    const targetDate = startOfDay(date);
    return chores.filter(chore => {
      const nextDue = startOfDay(new Date(chore.next_due));
      return isSameDay(nextDue, targetDate);
    });
  };

  const getPersonColor = (id) => people.find(p => p.id === id)?.color || '#6366f1';

  // Shopping list by category
  const itemsByCategory = SHOPPING_CATEGORIES.map(cat => ({
    ...cat,
    items: uncheckedItems.filter(item => item.category === cat.value)
  })).filter(cat => cat.items.length > 0);

  const stats = [
    {
      label: 'People',
      value: people.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'This Month',
      value: `£${monthlyExpenses.toFixed(0)}`,
      icon: PoundSterling,
      color: 'text-finance',
      bgColor: 'bg-finance/10'
    },
    {
      label: 'To Buy',
      value: uncheckedItems.length,
      icon: ShoppingCart,
      color: 'text-food',
      bgColor: 'bg-food/10'
    },
    {
      label: 'Due Today',
      value: dueChores.length,
      icon: CheckSquare,
      color: 'text-chores',
      bgColor: 'bg-chores/10'
    },
  ];

  return (
    <div className="fade-in">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h2>
        <p className="text-[var(--text-secondary)] text-lg">Welcome to your home management hub</p>
      </div>

      {/* Alerts */}
      {(expiringItems.length > 0 || lowStockItems.length > 0) && (
        <div className="mb-8 space-y-3">
          {expiringItems.length > 0 && (
            <Link to="/food/pantry" className="card block border-l-4 border-l-warning hover:border-warning/50 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{expiringItems.length} items expiring soon</p>
                  <p className="text-sm text-[var(--text-secondary)]">Check your pantry</p>
                </div>
              </div>
            </Link>
          )}
          {lowStockItems.length > 0 && (
            <Link to="/food/pantry" className="card block border-l-4 border-l-danger hover:border-danger/50 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-danger" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{lowStockItems.length} items running low</p>
                  <p className="text-sm text-[var(--text-secondary)]">Restock needed</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finance Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Income vs Expenses This Month</h3>
              <Link to="/finances/charts" className="text-sm text-finance hover:underline">
                View All Charts
              </Link>
            </div>
            <div className="h-[250px]">
              {financeChartData.some(d => d.expenses > 0 || d.income > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `£${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      formatter={(value) => `£${value.toFixed(2)}`}
                    />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No income or expense data for this month</p>
                    <Link to="/finances/expenses" className="text-finance text-sm hover:underline mt-2 inline-block">
                      Add your first transaction
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#22c55e]" />
                <span className="text-[var(--text-secondary)]">Income: £{monthlyIncome.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#ef4444]" />
                <span className="text-[var(--text-secondary)]">Expenses: £{monthlyExpenses.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shopping List */}
        <div>
          <div className="card h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Shopping List</h3>
              <Link to="/food/shopping" className="text-sm text-food hover:underline">
                View All
              </Link>
            </div>
            {uncheckedItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-[var(--text-secondary)] opacity-50" />
                <p className="text-[var(--text-secondary)] text-sm">No items to buy</p>
                <Link to="/food/shopping" className="text-food text-sm hover:underline mt-2 inline-block">
                  Add items
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {itemsByCategory.slice(0, 3).map((category) => (
                  <div key={category.value}>
                    <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                      {category.label}
                    </h4>
                    <div className="space-y-1">
                      {category.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-[var(--text-primary)]">{item.name}</span>
                          <span className="text-[var(--text-secondary)] text-xs">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                      {category.items.length > 3 && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          +{category.items.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {itemsByCategory.length > 3 && (
                  <Link to="/food/shopping" className="text-food text-sm hover:underline block text-center pt-2">
                    +{itemsByCategory.length - 3} more categories
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Chores Calendar */}
      <div className="mt-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">This Week's Chores</h3>
            <Link to="/chores/calendar" className="text-sm text-chores hover:underline">
              View Calendar
            </Link>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
              const day = weekDays[idx];
              const dayChores = getChoresForDay(day);
              const isToday = isSameDay(day, now);

              return (
                <div
                  key={dayName}
                  className={`min-h-[120px] p-2 rounded-lg border ${isToday
                      ? 'border-chores bg-chores/5'
                      : 'border-[var(--border)] bg-[var(--bg-dark)]'
                    }`}
                >
                  <p className={`text-xs font-medium mb-2 ${isToday ? 'text-chores' : 'text-[var(--text-secondary)]'}`}>
                    {dayName}
                  </p>
                  <p className={`text-lg font-bold mb-2 ${isToday ? 'text-chores' : 'text-[var(--text-primary)]'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-1">
                    {dayChores.slice(0, 2).map((chore, choreIdx) => (
                      <div
                        key={choreIdx}
                        className="text-xs px-1.5 py-0.5 rounded truncate text-white"
                        style={{ backgroundColor: getPersonColor(chore.assigned_to) }}
                      >
                        {chore.name}
                      </div>
                    ))}
                    {dayChores.length > 2 && (
                      <p className="text-xs text-[var(--text-secondary)] text-center">
                        +{dayChores.length - 2}
                      </p>
                    )}
                    {dayChores.length === 0 && (
                      <p className="text-xs text-[var(--text-secondary)] opacity-50">-</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
