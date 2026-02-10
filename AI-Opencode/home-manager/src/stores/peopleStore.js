import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const usePeopleStore = create((set, get) => ({
  people: [],
  loading: false,
  error: null,

  loadPeople: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ people: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addPerson: async (person) => {
    try {
      // For manual add, we don't set user_id
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          name: person.name,
          color: person.color,
          avatar: person.avatar
        }])
        .select()
        .single();

      if (error) throw error;
      await get().loadPeople();
      return data.id;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updatePerson: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().loadPeople();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deletePerson: async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().loadPeople();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getPersonById: (id) => {
    return get().people.find(p => p.id === id);
  }
}));
