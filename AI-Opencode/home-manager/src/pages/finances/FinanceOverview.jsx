import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PoundSterling, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  CreditCard,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';

function FinanceOverview() {
  const { 
    expenses, 
    incomes, 
    savingsGoals, 
    subscriptions,
    loadAllData 
  } = useFinanceStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate totals
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

  const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const monthlySubscriptions = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => {
      let amount = s.amount;
      switch (s.frequency) {
        case 'weekly': amount = s.amount * 4.33; break;
        case 'quarterly': amount = s.amount / 3; break;
        case 'yearly': amount = s.amount / 12; break;
      }
      return sum + amount;
    }, 0);

  const stats = [
    { 
      label: 'Monthly Income', 
      value: `£${monthlyIncome.toFixed(2)}`, 
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      label: 'Monthly Expenses', 
      value: `£${monthlyExpenses.toFixed(2)}`, 
      icon: TrendingDown,
      color: 'text-danger',
      bgColor: 'bg-danger/10'
    },
    { 
      label: 'Total Savings', 
      value: `£${totalSavings.toFixed(2)}`, 
      icon: PiggyBank,
      color: 'text-finance',
      bgColor: 'bg-finance/10'
    },
    { 
      label: 'Monthly Subscriptions', 
      value: `£${monthlySubscriptions.toFixed(2)}`, 
      icon: CreditCard,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
  ];

  const quickLinks = [
    { to: '/finances/expenses', label: 'Expenses', icon: PoundSterling, color: 'finance' },
    { to: '/finances/income', label: 'Income', icon: TrendingUp, color: 'finance' },
    { to: '/finances/budgets', label: 'Budgets', icon: PiggyBank, color: 'finance' },
    { to: '/finances/savings', label: 'Savings Goals', icon: PiggyBank, color: 'finance' },
    { to: '/finances/subscriptions', label: 'Subscriptions', icon: CreditCard, color: 'finance' },
    { to: '/finances/charts', label: 'Charts & Analytics', icon: TrendingUp, color: 'finance' },
  ];

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Finances</h2>
          <p className="text-[var(--text-secondary)] mt-1 text-base">
            Track expenses, income, budgets, and savings goals
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="card hover:border-finance/50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${link.color}/10 flex items-center justify-center`}>
                    <link.icon className={`w-5 h-5 text-${link.color}`} />
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{link.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-finance transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <Link 
            to="/finances/expenses" 
            className="text-sm text-finance hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {expenses.length === 0 && incomes.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Add your first expense or income to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...expenses, ...incomes]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((item, index) => {
                const isExpense = 'category' in item;
                return (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isExpense ? 'bg-danger/10' : 'bg-success/10'
                      }`}>
                        {isExpense ? (
                          <TrendingDown className="w-5 h-5 text-danger" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-success" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {item.description || item.source}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {new Date(item.date).toLocaleDateString()}
                          {isExpense && ` • ${item.category}`}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${isExpense ? 'text-danger' : 'text-success'}`}>
                      {isExpense ? '-' : '+'}£{item.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FinanceOverview;
