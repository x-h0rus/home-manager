import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { addDays, addWeeks, addMonths, isSameDay, isBefore, startOfDay } from 'date-fns';

export const useChoresStore = create((set, get) => ({
  chores: [],
  choreCompletions: [],
  loading: false,
  error: null,

  loadAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        { data: chores, error: choresError },
        { data: completions, error: completionsError }
      ] = await Promise.all([
        supabase.from('chores').select('*'),
        supabase.from('chore_completions').select('*').order('completed_at', { ascending: false })
      ]);

      if (choresError) throw choresError;
      if (completionsError) throw completionsError;

      // Parse frequency JSON string back to object for each chore
      const parsedChores = (chores || []).map(chore => ({
        ...chore,
        frequency: typeof chore.frequency === 'string'
          ? (() => { try { return JSON.parse(chore.frequency); } catch { return chore.frequency; } })()
          : chore.frequency
      }));

      set({
        chores: parsedChores,
        choreCompletions: completions || [],
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // DB columns: id, name, assigned_to (uuid), frequency (text), next_due (date), priority (text), created_at
  addChore: async (chore) => {
    try {
      // assigned_to is a single UUID in DB, but the form sends an array.
      // Take the first assignee for now.
      const assignedTo = Array.isArray(chore.assignedTo)
        ? chore.assignedTo[0]
        : chore.assignedTo;

      const { data, error } = await supabase
        .from('chores')
        .insert([{
          name: chore.name,
          assigned_to: assignedTo,
          frequency: JSON.stringify(chore.frequency),
          next_due: chore.nextDue,
          priority: chore.priority || 'medium'
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

  updateChore: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.assignedTo !== undefined) {
        dbUpdates.assigned_to = Array.isArray(updates.assignedTo)
          ? updates.assignedTo[0]
          : updates.assignedTo;
      }
      if (updates.frequency !== undefined) {
        dbUpdates.frequency = JSON.stringify(updates.frequency);
      }
      if (updates.nextDue !== undefined) dbUpdates.next_due = updates.nextDue;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

      const { error } = await supabase
        .from('chores')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteChore: async (id) => {
    try {
      const { error } = await supabase.from('chores').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // DB columns for chore_completions: id, chore_id, completed_by (uuid), completed_at
  completeChore: async (choreId, completedBy, notes = '') => {
    try {
      const now = new Date();

      const { error: completionError } = await supabase
        .from('chore_completions')
        .insert([{
          chore_id: choreId,
          completed_by: completedBy,
          completed_at: now.toISOString()
        }]);

      if (completionError) throw completionError;

      // Calculate next due date
      const chore = get().chores.find(c => c.id === choreId);
      if (chore) {
        const frequency = typeof chore.frequency === 'string'
          ? JSON.parse(chore.frequency)
          : chore.frequency;

        const nextDue = calculateNextDue({ ...chore, frequency }, now);

        await supabase
          .from('chores')
          .update({ next_due: nextDue.toISOString() })
          .eq('id', choreId);
      }

      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Getters
  getTodaysChores: () => {
    const { chores } = get();
    const today = startOfDay(new Date());
    return chores.filter(chore => {
      const nextDue = startOfDay(new Date(chore.next_due));
      return isSameDay(nextDue, today) || isBefore(nextDue, today);
    }).sort((a, b) => new Date(a.next_due) - new Date(b.next_due));
  },

  getOverdueChores: () => {
    const { chores } = get();
    const today = startOfDay(new Date());
    return chores.filter(chore => {
      const nextDue = startOfDay(new Date(chore.next_due));
      return isBefore(nextDue, today);
    });
  },

  getUpcomingChores: (days = 7) => {
    const { chores } = get();
    const today = startOfDay(new Date());
    const future = addDays(today, days);
    return chores.filter(chore => {
      const nextDue = new Date(chore.next_due);
      return nextDue > today && nextDue <= future;
    });
  },

  getChoresForDate: (date) => {
    const { chores } = get();
    const targetDate = startOfDay(new Date(date));
    return chores.filter(chore => {
      const nextDue = startOfDay(new Date(chore.next_due));
      return isSameDay(nextDue, targetDate);
    });
  },

  getChoreStats: () => {
    const { choreCompletions, chores } = get();
    const now = new Date();
    const weekAgo = addDays(now, -7);

    const completionsThisWeek = choreCompletions.filter(c =>
      new Date(c.completed_at) >= weekAgo
    );

    const byPerson = {};
    completionsThisWeek.forEach(c => {
      byPerson[c.completed_by] = (byPerson[c.completed_by] || 0) + 1;
    });

    return {
      totalCompleted: choreCompletions.length,
      completedThisWeek: completionsThisWeek.length,
      byPerson,
      totalChores: chores.length
    };
  },

  getNextAssignee: (chore) => {
    return chore.assigned_to;
  }
}));

function calculateNextDue(chore, completedAt) {
  const { frequency } = chore;

  switch (frequency.type) {
    case 'daily':
      return addDays(completedAt, 1);

    case 'weekly':
      if (frequency.daysOfWeek && frequency.daysOfWeek.length > 0) {
        let nextDate = addDays(completedAt, 1);
        const currentDay = nextDate.getDay();
        const sortedDays = [...frequency.daysOfWeek].sort((a, b) => a - b);

        const nextDay = sortedDays.find(d => d > currentDay);
        if (nextDay !== undefined) {
          return addDays(nextDate, nextDay - currentDay);
        }
        return addDays(nextDate, 7 - currentDay + sortedDays[0]);
      }
      return addDays(completedAt, 7);

    case 'biweekly':
      return addWeeks(completedAt, 2);

    case 'monthly':
      return addMonths(completedAt, 1);

    case 'custom':
      return addDays(completedAt, frequency.customDays || 7);

    default:
      return addDays(completedAt, 7);
  }
}
