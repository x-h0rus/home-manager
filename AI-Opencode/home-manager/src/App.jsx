import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import People from './pages/People';

// Finance pages
import FinanceOverview from './pages/finances/FinanceOverview';
import Expenses from './pages/finances/Expenses';
import Income from './pages/finances/Income';
import Budgets from './pages/finances/Budgets';
import Savings from './pages/finances/Savings';
import Subscriptions from './pages/finances/Subscriptions';
import FinanceCharts from './pages/finances/FinanceCharts';

// Food pages
import FoodOverview from './pages/food/FoodOverview';
import ShoppingList from './pages/food/ShoppingList';
import Menu from './pages/food/Menu';
import Pantry from './pages/food/Pantry';

// Chores pages
import ChoresToday from './pages/chores/ChoresToday';
import ChoresCalendar from './pages/chores/ChoresCalendar';
import ChoresManage from './pages/chores/ChoresManage';
import ChoresStats from './pages/chores/ChoresStats';

function App() {
  // Initialize dark mode based on system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="people" element={<People />} />

            {/* Finance Routes */}
            <Route path="finances" element={<FinanceOverview />} />
            <Route path="finances/expenses" element={<Expenses />} />
            <Route path="finances/income" element={<Income />} />
            <Route path="finances/budgets" element={<Budgets />} />
            <Route path="finances/savings" element={<Savings />} />
            <Route path="finances/subscriptions" element={<Subscriptions />} />
            <Route path="finances/charts" element={<FinanceCharts />} />

            {/* Food Routes */}
            <Route path="food" element={<FoodOverview />} />
            <Route path="food/shopping" element={<ShoppingList />} />
            <Route path="food/menu" element={<Menu />} />
            <Route path="food/pantry" element={<Pantry />} />

            {/* Chores Routes */}
            <Route path="chores" element={<ChoresToday />} />
            <Route path="chores/calendar" element={<ChoresCalendar />} />
            <Route path="chores/manage" element={<ChoresManage />} />
            <Route path="chores/stats" element={<ChoresStats />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
