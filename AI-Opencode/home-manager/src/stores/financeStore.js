import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useFinanceStore = create((set, get) => ({
  // State
  expenses: [],
  incomes: [],
  budgets: [],
  savingsGoals: [],
  subscriptions: [],
  loading: false,
  error: null,

  // Load all finance data
  loadAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        { data: expenses, error: expensesError },
        { data: incomes, error: incomesError },
        { data: budgets, error: budgetsError },
        { data: savingsGoals, error: savingsError },
        { data: subscriptions, error: subsError }
      ] = await Promise.all([
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('incomes').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('savings_goals').select('*'),
        supabase.from('subscriptions').select('*')
      ]);

      if (expensesError) throw expensesError;
      if (incomesError) throw incomesError;
      if (budgetsError) throw budgetsError;
      if (savingsError) throw savingsError;
      if (subsError) throw subsError;

      set({
        expenses: expenses || [],
        incomes: incomes || [],
        budgets: budgets || [],
        savingsGoals: savingsGoals || [],
        subscriptions: subscriptions || [],
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // ─── Expenses ───
  // DB columns: id, amount, category, paid_by (uuid), date, description, is_recurring, created_at
  addExpense: async (expense) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          amount: expense.amount,
          category: expense.category,
          paid_by: expense.paidBy,
          date: expense.date,
          description: expense.description || '',
          is_recurring: expense.isRecurring || false
        }])
        .select()
        .single();

      if (error) throw error;
      await get().loadAllData();
      return data.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateExpense: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.paidBy !== undefined) dbUpdates.paid_by = updates.paidBy;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;

      const { error } = await supabase
        .from('expenses')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // ─── Income ───
  // DB columns: id, amount, source, earned_by (uuid), date, description, is_recurring, created_at
  addIncome: async (income) => {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert([{
          amount: income.amount,
          source: income.source,
          earned_by: income.earnedBy,
          date: income.date,
          description: income.description || '',
          is_recurring: income.isRecurring || false
        }])
        .select()
        .single();

      if (error) throw error;
      await get().loadAllData();
      return data.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateIncome: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.source !== undefined) dbUpdates.source = updates.source;
      if (updates.earnedBy !== undefined) dbUpdates.earned_by = updates.earnedBy;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;

      const { error } = await supabase
        .from('incomes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteIncome: async (id) => {
    try {
      const { error } = await supabase.from('incomes').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // ─── Budgets ───
  // DB columns: id, category, amount, month, year, created_at
  addBudget: async (budget) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          category: budget.category,
          amount: budget.amount,
          month: budget.month,
          year: budget.year
        }])
        .select()
        .single();

      if (error) throw error;
      await get().loadAllData();
      return data.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateBudget: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.month !== undefined) dbUpdates.month = updates.month;
      if (updates.year !== undefined) dbUpdates.year = updates.year;

      const { error } = await supabase.from('budgets').update(dbUpdates).eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteBudget: async (id) => {
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // ─── Savings Goals ───
  // DB columns: id, name, target_amount, current_amount, deadline, created_at
  addSavingsGoal: async (goal) => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount || 0,
          deadline: goal.deadline
        }])
        .select()
        .single();

      if (error) throw error;
      await get().loadAllData();
      return data.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateSavingsGoal: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

      const { error } = await supabase
        .from('savings_goals')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSavingsGoal: async (id) => {
    try {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // ─── Subscriptions ───
  // DB columns: id, name, amount, frequency, next_billing_date, category, start_date, is_active, created_at
  addSubscription: async (subscription) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          name: subscription.name,
          amount: subscription.amount,
          frequency: subscription.frequency,
          next_billing_date: subscription.nextBillingDate,
          category: subscription.category,
          start_date: subscription.startDate,
          is_active: subscription.isActive !== undefined ? subscription.isActive : true
        }])
        .select()
        .single();

      if (error) throw error;
      await get().loadAllData();
      return data.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateSubscription: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.nextBillingDate !== undefined) dbUpdates.next_billing_date = updates.nextBillingDate;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('subscriptions')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSubscription: async (id) => {
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // ─── Calculations (work on local state) ───
  getTotalExpenses: (month, year) => {
    const { expenses } = get();
    return expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getTotalIncome: (month, year) => {
    const { incomes } = get();
    return incomes
      .filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, i) => sum + i.amount, 0);
  },

  getExpensesByCategory: (month, year) => {
    const { expenses } = get();
    const filtered = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const byCategory = {};
    filtered.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    return byCategory;
  },

  getMonthlySubscriptionTotal: () => {
    const { subscriptions } = get();
    return subscriptions
      .filter(s => s.is_active)
      .reduce((sum, s) => {
        let monthlyAmount = s.amount;
        switch (s.frequency) {
          case 'weekly':
            monthlyAmount = s.amount * 4.33;
            break;
          case 'quarterly':
            monthlyAmount = s.amount / 3;
            break;
          case 'yearly':
            monthlyAmount = s.amount / 12;
            break;
        }
        return sum + monthlyAmount;
      }, 0);
  }
}));
