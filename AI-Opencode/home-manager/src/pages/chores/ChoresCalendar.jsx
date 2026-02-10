import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChoresStore } from '../../stores/choresStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, startOfDay } from 'date-fns';

function ChoresCalendar() {
  const { chores, loadAllData } = useChoresStore();
  const { people, loadPeople } = usePeopleStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { loadAllData(); loadPeople(); }, [loadAllData, loadPeople]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getChoresForDay = (date) => {
    const targetDate = startOfDay(date);
    return chores.filter(chore => {
      const nextDue = startOfDay(new Date(chore.next_due));
      return isSameDay(nextDue, targetDate);
    });
  };

  const getPersonColor = (id) => people.find(p => p.id === id)?.color || '#6366f1';
  const getPersonName = (id) => people.find(p => p.id === id)?.name || '?';

  const today = new Date();

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Chore Calendar</h2>
        <div className="flex items-center gap-4">
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
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-[var(--text-secondary)]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayChores = getChoresForDay(day);
          const isToday = isSameDay(day, today);
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`card min-h-[150px] cursor-pointer transition-all ${isToday ? 'ring-2 ring-chores' : ''
                } ${isSelected ? 'border-chores' : ''}`}
            >
              <p className={`text-sm font-medium mb-2 ${isToday ? 'text-chores' : 'text-[var(--text-secondary)]'}`}>
                {format(day, 'd')}
              </p>
              <div className="space-y-1">
                {dayChores.slice(0, 4).map((chore, idx) => (
                  <div
                    key={idx}
                    className="text-xs px-2 py-1 rounded truncate text-white"
                    style={{ backgroundColor: getPersonColor(chore.assigned_to) }}
                  >
                    {chore.name}
                  </div>
                ))}
                {dayChores.length > 4 && (
                  <p className="text-xs text-[var(--text-secondary)] text-center">+{dayChores.length - 4} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">{format(selectedDay, 'EEEE, MMMM d')}</h3>
          <div className="space-y-2">
            {getChoresForDay(selectedDay).map(chore => (
              <div key={chore.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: getPersonColor(chore.assigned_to) }}
                  >
                    {getPersonName(chore.assigned_to)?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{chore.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{getPersonName(chore.assigned_to)}</p>
                  </div>
                </div>
              </div>
            ))}
            {getChoresForDay(selectedDay).length === 0 && (
              <p className="text-[var(--text-secondary)]">No chores scheduled for this day</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChoresCalendar;
