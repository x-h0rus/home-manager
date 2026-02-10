import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Sparkles } from 'lucide-react';
import { useFoodStore } from '../../stores/foodStore';
import { useModalScroll } from '../../hooks/useModalScroll';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 Breakfast', icon: '🌅' },
  { value: 'lunch', label: '☀️ Lunch', icon: '☀️' },
  { value: 'dinner', label: '🌙 Dinner', icon: '🌙' },
  { value: 'snack', label: '🍿 Snack', icon: '🍿' },
];

function Menu() {
  const { menuItems, loadAllData, addMenuItem, deleteMenuItem, generateShoppingListFromMenu } = useFoodStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    mealType: 'dinner',
    recipeName: '',
    servings: 2,
    cookTime: '',
    ingredients: [],
    notes: ''
  });
  const [ingredientInput, setIngredientInput] = useState('');

  useModalScroll(showForm);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMealsForDay = (date) => {
    return menuItems.filter(item => {
      const itemDate = new Date(item.date);
      return format(itemDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addMenuItem(formData);
    setShowForm(false);
    setFormData({ date: '', mealType: 'dinner', recipeName: '', servings: 2, cookTime: '', ingredients: [], notes: '' });
    setIngredientInput('');
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({ ...formData, ingredients: [...formData.ingredients, ingredientInput.trim()] });
      setIngredientInput('');
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Weekly Menu</h2>
          <p className="text-[var(--text-secondary)]">Plan your meals for the week</p>
        </div>
        <button 
          onClick={() => generateShoppingListFromMenu(weekStart)}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Generate List
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="p-2 rounded-lg hover:bg-[var(--bg-dark)]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="p-2 rounded-lg hover:bg-[var(--bg-dark)]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-[var(--text-secondary)]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const meals = getMealsForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div 
              key={day.toISOString()} 
              onClick={() => { setSelectedDay(day); setFormData({ ...formData, date: day }); setShowForm(true); }}
              className={`card min-h-[120px] cursor-pointer hover:border-food/50 transition-colors ${isToday ? 'ring-2 ring-food' : ''}`}
            >
              <p className={`text-sm font-medium mb-2 ${isToday ? 'text-food' : 'text-[var(--text-secondary)]'}`}>
                {format(day, 'd')}
              </p>
              <div className="space-y-1">
                {meals.slice(0, 3).map((meal, idx) => (
                  <p key={idx} className="text-xs text-[var(--text-primary)] truncate">
                    {MEAL_TYPES.find(m => m.value === meal.mealType)?.icon} {meal.recipeName}
                  </p>
                ))}
                {meals.length > 3 && (
                  <p className="text-xs text-[var(--text-secondary)]">+{meals.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Detail */}
      {selectedDay && !showForm && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">{format(selectedDay, 'EEEE, MMMM d')}</h3>
          <div className="space-y-3">
            {MEAL_TYPES.map((mealType) => {
              const meals = getMealsForDay(selectedDay).filter(m => m.mealType === mealType.value);
              return (
                <div key={mealType.value} className="card">
                  <h4 className="font-medium text-[var(--text-primary)] mb-2">{mealType.label}</h4>
                  {meals.length === 0 ? (
                    <button 
                      onClick={() => { setFormData({ ...formData, date: selectedDay, mealType: mealType.value }); setShowForm(true); }}
                      className="text-sm text-[var(--text-secondary)] hover:text-food"
                    >
                      + Add meal
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {meals.map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{meal.recipeName}</p>
                            {meal.cookTime && <p className="text-xs text-[var(--text-secondary)]">🕐 {meal.cookTime} min • {meal.servings} servings</p>}
                          </div>
                          <button onClick={() => deleteMenuItem(meal.id)} className="p-2 hover:bg-[var(--bg-dark)] rounded text-danger">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Add Meal</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formData.mealType} onChange={e => setFormData({...formData, mealType: e.target.value})} className="input">
                {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input type="text" value={formData.recipeName} onChange={e => setFormData({...formData, recipeName: e.target.value})} className="input" placeholder="Recipe name" required />
              <div className="flex gap-3">
                <input type="number" min="1" value={formData.servings} onChange={e => setFormData({...formData, servings: parseInt(e.target.value)})} className="input" placeholder="Servings" />
                <input type="number" min="1" value={formData.cookTime} onChange={e => setFormData({...formData, cookTime: e.target.value})} className="input" placeholder="Cook time (min)" />
              </div>
              <div>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={ingredientInput} onChange={e => setIngredientInput(e.target.value)} className="input flex-1" placeholder="Add ingredient" />
                  <button type="button" onClick={addIngredient} className="px-4 py-2 bg-[var(--bg-dark)] rounded-lg">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.map((ing, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[var(--bg-dark)] rounded text-sm flex items-center gap-1">
                      {ing}
                      <button type="button" onClick={() => setFormData({...formData, ingredients: formData.ingredients.filter((_, i) => i !== idx)})}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input" placeholder="Notes" rows="3" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)]">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;
