import { useEffect } from 'react';
import { Trophy, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useChoresStore } from '../../stores/choresStore';
import { usePeopleStore } from '../../stores/peopleStore';

function ChoresStats() {
  const { chores, choreCompletions, loadAllData, getChoreStats } = useChoresStore();
  const { people, loadPeople } = usePeopleStore();

  useEffect(() => { loadAllData(); loadPeople(); }, [loadAllData, loadPeople]);

  const stats = getChoreStats();

  const getPersonName = (id) => people.find(p => p.id === parseInt(id))?.name || 'Unknown';
  const getPersonColor = (id) => people.find(p => p.id === parseInt(id))?.color || '#6366f1';

  // Sort by completions
  const leaderboard = Object.entries(stats.byPerson)
    .sort(([,a], [,b]) => b - a)
    .map(([personId, count], index) => ({
      rank: index + 1,
      personId: parseInt(personId),
      count
    }));

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Chore Statistics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-chores/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-chores" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCompleted}</p>
          <p className="text-sm text-[var(--text-secondary)]">Total Completed</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completedThisWeek}</p>
          <p className="text-sm text-[var(--text-secondary)]">This Week</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalChores}</p>
          <p className="text-sm text-[var(--text-secondary)]">Active Chores</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{leaderboard[0]?.count || 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">Leader Score</p>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" /> This Week's Leaders
          </h3>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.personId} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getPersonColor(entry.personId) }}
                  >
                    {getPersonName(entry.personId)?.charAt(0)}
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{getPersonName(entry.personId)}</span>
                </div>
                <span className="font-bold text-chores">{entry.count} chores</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Completions</h3>
        <div className="space-y-2">
          {choreCompletions
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 10)
            .map((completion, idx) => {
              const chore = chores.find(c => c.id === completion.choreId);
              if (!chore) return null;
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getPersonColor(completion.completedBy) }}
                    >
                      {getPersonName(completion.completedBy)?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{chore.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Completed by {getPersonName(completion.completedBy)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          {choreCompletions.length === 0 && (
            <p className="text-[var(--text-secondary)] text-center py-4">No completions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChoresStats;
