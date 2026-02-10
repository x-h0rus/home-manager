import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      <Header />
      <main className="pt-8 md:pt-10 pb-32 px-5 md:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}

export default Layout;
