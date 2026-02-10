import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, Home, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const savedTheme = localStorage.getItem('theme');
  const initialIsDark = savedTheme !== 'light';
  const [isDark, setIsDark] = useState(initialIsDark);
  const [currentDate] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 md:px-6 py-4 md:py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Go to Home"
          >
            <Home className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Home Manager</h1>
            <p className="text-xs text-[var(--text-secondary)] hidden sm:block">{currentDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden md:flex items-center gap-2 mr-2 px-3 py-1.5 bg-[var(--bg-dark)] rounded-lg">
              <UserIcon className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {user.user_metadata?.name || user.email}
              </span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--bg-dark)] transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-[var(--text-secondary)]" />
            ) : (
              <Moon className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-[var(--bg-dark)] transition-colors text-danger hover:text-danger/80"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
