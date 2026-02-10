import { useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFinanceStore } from '../../stores/financeStore';
import { usePeopleStore } from '../../stores/peopleStore';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'];

const CATEGORY_NAMES = {
  housing: 'Housing', utilities: 'Utilities', groceries: 'Groceries',
  transportation: 'Transportation', entertainment: 'Entertainment',
  healthcare: 'Healthcare', dining: 'Dining', shopping: 'Shopping',
  education: 'Education', personal: 'Personal', other: 'Other'
};

function FinanceCharts() {
  const { expenses, incomes, loadAllData } = useFinanceStore();
  const { people, loadPeople } = usePeopleStore();

  useEffect(() => { loadAllData(); loadPeople(); }, [loadAllData, loadPeople]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const data = {};
    expenses.forEach(e => {
      const date = new Date(e.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        data[e.category] = (data[e.category] || 0) + e.amount;
      }
    });
    return Object.entries(data).map(([name, value]) => ({ name: CATEGORY_NAMES[name] || name, value }));
  }, [expenses, currentMonth, currentYear]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthExpenses = expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === month && ed.getFullYear() === year;
      }).reduce((sum, e) => sum + e.amount, 0);
      const monthIncome = incomes.filter(inc => {
        const id = new Date(inc.date);
        return id.getMonth() === month && id.getFullYear() === year;
      }).reduce((sum, inc) => sum + inc.amount, 0);
      data.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        expenses: monthExpenses,
        income: monthIncome
      });
    }
    return data;
  }, [expenses, incomes, currentMonth, currentYear]);

  // Balance calculations
  const balances = useMemo(() => {
    const personExpenses = {};
    const personPaid = {};
    
    expenses.forEach(e => {
      const date = new Date(e.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        // Track what each person paid
        personPaid[e.paidBy] = (personPaid[e.paidBy] || 0) + e.amount;
        
        // Track what each person owes
        if (e.splitWith && e.splitWith.length > 0) {
          const share = e.amount / (e.splitWith.length + 1);
          e.splitWith.forEach(personId => {
            personExpenses[personId] = (personExpenses[personId] || 0) + share;
          });
          personExpenses[e.paidBy] = (personExpenses[e.paidBy] || 0) + share;
        } else {
          personExpenses[e.paidBy] = (personExpenses[e.paidBy] || 0) + e.amount;
        }
      }
    });

    return people.map(p => ({
      name: p.name,
      paid: personPaid[p.id] || 0,
      owes: personExpenses[p.id] || 0,
      balance: (personPaid[p.id] || 0) - (personExpenses[p.id] || 0)
    }));
  }, [expenses, people, currentMonth, currentYear]);

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Charts & Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-secondary)]">
              No expense data for this month
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          {monthlyTrend.some(d => d.expenses > 0 || d.income > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  formatter={(value) => `£${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-secondary)]">
              No data available
            </div>
          )}
        </div>

        {/* Balances */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Who Owes Who (This Month)</h3>
          {balances.some(b => b.paid > 0 || b.owes > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((person) => (
                <div key={person.name} className="p-4 bg-[var(--bg-dark)] rounded-lg">
                  <p className="font-semibold text-[var(--text-primary)]">{person.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-success">Paid: £{person.paid.toFixed(2)}</p>
                    <p className="text-danger">Owes: £{person.owes.toFixed(2)}</p>
                    <p className={`font-semibold ${person.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                      Balance: {person.balance >= 0 ? '+' : ''}£{person.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-secondary)]">No expense data for this month</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceCharts;
