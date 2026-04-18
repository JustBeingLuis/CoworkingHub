import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Users,
  PieChart,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/utils';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [];

  if (isAdmin) {
    navItems.push(
      { name: t('layout.dashboard'), to: '/dashboard', icon: LayoutDashboard },
      { name: t('layout.spaces'), to: '/admin/espacios', icon: Building2 },
      { name: t('layout.reservations'), to: '/admin/reservas', icon: CalendarCheck },
      { name: t('layout.users'), to: '/admin/usuarios', icon: Users },
      { name: t('layout.reports'), to: '/admin/reportes', icon: PieChart }
    );
  } else {
    navItems.push(
      { name: t('layout.spaces'), to: '/dashboard', icon: LayoutDashboard },
      { name: t('layout.myReservations'), to: '/mis-reservas', icon: CalendarCheck }
    );
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-zinc-950 dark:text-slate-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold tracking-tight">{t('layout.title')}</h1>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer: User + Settings */}
        <div className="mt-auto">
          {/* Settings Row */}
          <div className="mx-4 mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-zinc-900">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* User Info & Logout */}
          <div className="border-t border-slate-200 px-4 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-200">{user?.nombre}</p>
                <p className="text-xs truncate text-slate-500 dark:text-zinc-500">{user?.correo}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                {user?.rol}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              {t('layout.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <button 
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
