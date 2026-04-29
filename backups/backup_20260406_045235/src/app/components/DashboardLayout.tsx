import { Outlet, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Users, BarChart3, DollarSign, Settings, Bell, Search, Menu, Target, LogOut, Calendar, FileCheck, User } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: Array<{ path: string; label: string; icon: any }> = [];
  if (user?.role === 'attendee') {
    navItems.push({ path: '/dashboard/profile', label: 'My Profile', icon: User });
    navItems.push({ path: '/dashboard/events', label: 'Browse Events', icon: Calendar });
    navItems.push({ path: '/dashboard/registrations', label: 'My Requests', icon: FileCheck });
  } else {
    navItems.push({ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    if (user?.role === 'admin' || user?.role === 'organizer') {
      navItems.push({ path: '/dashboard/attendees', label: 'Attendees', icon: Users });
      navItems.push({ path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 });
    }
    navItems.push({ path: '/dashboard/sponsors', label: 'Sponsors', icon: DollarSign });
    navItems.push({ path: '/dashboard/events', label: 'Events', icon: Calendar });
    navItems.push({ path: '/dashboard/registrations', label: 'Registrations', icon: FileCheck });
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // User initials for avatar
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'AU';

  const roleLabel: Record<string, string> = {
    admin:     '👑 Admin',
    organizer: '🎤 Organizer',
    sponsor:   '💼 Sponsor',
    attendee:  '🎟 Attendee',
  };

  const SidebarContent = () => (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AudienceAI
        </span>
      </div>

      {/* User role badge */}
      {user && (
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Signed in as</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
            <span className="text-xs text-blue-600 font-medium">{roleLabel[user.role] || user.role}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="px-4 py-4 border-t space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </Button>
                <div className="relative flex-1 max-w-md hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendees, events..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-gray-200 hover:ring-blue-500 transition">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
