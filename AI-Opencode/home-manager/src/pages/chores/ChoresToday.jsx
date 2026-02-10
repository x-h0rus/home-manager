import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Clock, AlertCircle, X, Calendar } from 'lucide-react';
import { useChoresStore } from '../../stores/choresStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { format, isBefore, startOfDay } from 'date-fns';

function ChoresToday() {
  const { chores, choreCompletions, loadAllData, completeChore } = useChoresStore();
  const { people, loadPeople } = usePeopleStore();
  const [showCompleteModal, setShowCompleteModal] = useState(null);
  const [completedBy, setCompletedBy] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadAllData(); loadPeople(); }, [loadAllData, loadPeople]);

  const today = startOfDay(new Date());

  const overdueChores = chores.filter(chore => {
    const nextDue = new Date(chore.next_due);
    return isBefore(nextDue, today);
  });

  const dueTodayChores = chores.filter(chore => {
    const nextDue = new Date(chore.next_due);
    return format(nextDue, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  });

  const completedToday = choreCompletions.filter(c =>
    format(new Date(c.completed_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const handleComplete = async (e) => {
    e.preventDefault();
    if (showCompleteModal && completedBy) {
      await completeChore(showCompleteModal.id, completedBy, notes);
      setShowCompleteModal(null);
      setCompletedBy('');
      setNotes('');
    }
  };

  const getPersonName = (id) => people.find(p => p.id === id)?.name || 'Unknown';
  const getPersonColor = (id) => people.find(p => p.id === id)?.color || '#6366f1';

  const ChoreCard = ({ chore, isOverdue }) => (
    <div className={`card flex items-center justify-between ${isOverdue ? 'border-l-4 border-l-danger' : ''}`}>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: getPersonColor(chore.assigned_to) }}
        >
          {getPersonName(chore.assigned_to)?.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">{chore.name}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {getPersonName(chore.assigned_to)}
          </p>
        </div>
      </div>
      <button
        onClick={() => { setShowCompleteModal(chore); setCompletedBy(chore.assigned_to || ''); }}
        className="p-2 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-colors"
      >
        <Check className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Today's Chores</h2>
          <p className="text-[var(--text-secondary)]">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <Link
          to="/chores/manage"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Chore
        </Link>
      </div>

      {/* Overdue */}
      {overdueChores.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-danger font-semibold mb-3">
            <AlertCircle className="w-5 h-5" /> Overdue ({overdueChores.length})
          </h3>
          <div className="space-y-2">
            {overdueChores.map(chore => <ChoreCard key={chore.id} chore={chore} isOverdue />)}
          </div>
        </div>
      )}

      {/* Due Today */}
      {dueTodayChores.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-warning font-semibold mb-3">
            <Clock className="w-5 h-5" /> Due Today ({dueTodayChores.length})
          </h3>
          <div className="space-y-2">
            {dueTodayChores.map(chore => <ChoreCard key={chore.id} chore={chore} />)}
          </div>
        </div>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-success font-semibold mb-3">
            <Check className="w-5 h-5" /> Completed Today ({completedToday.length})
          </h3>
          <div className="space-y-2">
            {completedToday.map((completion, idx) => {
              const chore = chores.find(c => c.id === completion.chore_id);
              if (!chore) return null;
              return (
                <div key={idx} className="card opacity-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{chore.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Completed by {getPersonName(completion.completed_by)} at {format(new Date(completion.completed_at), 'h:mm a')}
                      </p>
                    </div>
                    <Check className="w-5 h-5 text-success" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {overdueChores.length === 0 && dueTodayChores.length === 0 && completedToday.length === 0 && (
        <div className="card text-center py-12">
          <Check className="w-16 h-16 text-success mx-auto mb-4" />
          <p className="text-[var(--text-primary)] font-medium mb-2">All caught up!</p>
          <p className="text-[var(--text-secondary)] mb-4">No chores due today</p>
          <Link to="/chores/manage" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add a Chore
          </Link>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Complete: {showCompleteModal.name}</h3>
              <button onClick={() => setShowCompleteModal(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Completed by</label>
                <select value={completedBy} onChange={e => setCompletedBy(e.target.value)} className="input" required>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" rows="3" placeholder="Any notes about completion..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCompleteModal(null)} className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)]">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChoresToday;
