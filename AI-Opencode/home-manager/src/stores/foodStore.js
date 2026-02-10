import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useFoodStore = create((set, get) => ({
  shoppingListItems: [],
  menuItems: [],
  pantryItems: [],
  loading: false,
  error: null,

  loadAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        { data: shoppingListItems, error: shoppingError },
        { data: menuItems, error: menuError },
        { data: pantryItems, error: pantryError }
      ] = await Promise.all([
        supabase.from('shopping_list_items').select('*').order('added_at', { ascending: false }),
        supabase.from('menu_items').select('*').order('date', { ascending: true }),
        supabase.from('pantry_items').select('*').order('name', { ascending: true })
      ]);

      if (shoppingError) throw shoppingError;
      if (menuError) throw menuError;
      if (pantryError) throw pantryError;

      set({
        shoppingListItems: shoppingListItems || [],
        menuItems: menuItems || [],
        pantryItems: pantryItems || [],
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Shopping List
  addShoppingItem: async (item) => {
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert([{
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          is_purchased: item.isPurchased || false
          // added_at defaults to now()
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

  updateShoppingItem: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.isPurchased !== undefined) dbUpdates.is_purchased = updates.isPurchased;

      const { error } = await supabase
        .from('shopping_list_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteShoppingItem: async (id) => {
    try {
      const { error } = await supabase.from('shopping_list_items').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearCheckedItems: async () => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('is_purchased', true);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  moveCheckedToPantry: async () => {
    try {
      const { shoppingListItems } = get();
      // Filter locally first to minimize calls if possible, or query DB.
      // Since we loadAllData, local state should be fresh enough or we can query.
      // Let's use local state to find what to move, then transact ideally.
      // Supabase JS doesn't support transactions easily client-side without RPC.
      // We'll do it sequentially for now.

      const checkedItems = shoppingListItems.filter(item => item.is_purchased); // Note: snake_case from DB

      if (checkedItems.length === 0) return;

      for (const item of checkedItems) {
        // Check if exists in pantry (by name)
        const { data: existing } = await supabase
          .from('pantry_items')
          .select('*')
          .ilike('name', item.name)
          .single();

        if (existing) {
          await supabase
            .from('pantry_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('pantry_items')
            .insert([{
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              location: 'pantry'
            }]);
        }

        // Delete from shopping list
        await supabase.from('shopping_list_items').delete().eq('id', item.id);
      }

      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Menu
  addMenuItem: async (item) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          date: item.date,
          meal_type: item.mealType,
          recipe_name: item.recipeName,
          notes: item.notes || ''
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

  updateMenuItem: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
      if (updates.recipeName !== undefined) dbUpdates.recipe_name = updates.recipeName;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('menu_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteMenuItem: async (id) => {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  generateShoppingListFromMenu: async (weekStart) => {
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data: meals } = await supabase
        .from('menu_items')
        .select('*')
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString());

      if (!meals) return;

      for (const meal of meals) {
        // Parsing ingredients here might need adjustment if they aren't stored structured in DB
        // The original code assumed `meal.ingredients` exists. 
        // If strict schema, we might need a JSONB column or separate table.
        // For now assuming we just don't have ingredients in simple schema or it's in notes/text?
        // The current schema `menu_items` doesn't have ingredients column. 
        // We'll skip this logic for now or log warning as it requires schema update or JSON column.
        console.warn("Ingredients generation not fully supported in current schema");
      }
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Pantry
  addPantryItem: async (item) => {
    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert([{
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          expiration_date: item.expirationDate,
          location: item.location
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

  updatePantryItem: async (id, updates) => {
    try {
      const dbUpdates = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;
      if (updates.location !== undefined) dbUpdates.location = updates.location;

      const { error } = await supabase
        .from('pantry_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deletePantryItem: async (id) => {
    try {
      const { error } = await supabase.from('pantry_items').delete().eq('id', id);
      if (error) throw error;
      await get().loadAllData();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  addLowStockToList: async () => {
    // Requires minimum_stock column in pantry_items or logic change.
    // Schema didn't have minimum_stock. 
    // We'll skip or implement if schema allows.
    console.warn("Low stock feature pending schema update");
  },

  // Getters
  getExpiringItems: () => {
    const { pantryItems } = get();
    const now = new Date();
    return pantryItems.filter(item => {
      if (!item.expiration_date) return false;
      const expDate = new Date(item.expiration_date);
      const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= -1;
    }).sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
  },

  getLowStockItems: () => {
    // Pending schema support for minimum_stock
    return [];
  }
}));
