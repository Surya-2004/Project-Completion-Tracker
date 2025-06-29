import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Plus, Building2, BarChart3, MessageSquare, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../hooks/useAuth';
import { Separator } from './ui/separator';

const navItems = [
  { to: '/teams', label: 'Teams', icon: <Users className="w-5 h-5" /> },
  { to: '/teams/add', label: 'Add Team', icon: <Plus className="w-5 h-5" /> },
  { to: '/departments', label: 'Departments', icon: <Building2 className="w-5 h-5" /> },
  { to: '/interviews', label: 'Interviews', icon: <MessageSquare className="w-5 h-5" /> },
  { to: '/statistics', label: 'Statistics', icon: <BarChart3 className="w-5 h-5" /> },
];

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 bg-card text-card-foreground flex flex-col shadow-lg border-r border-border">
        <div className="flex items-center gap-3 p-6 text-xl font-bold tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16L14 22L24 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span className="text-blue-600">Project Tracker</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Button
                key={item.to}
                asChild
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link to={item.to}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* User Info and Logout Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.organization}</p>
            </div>
          </div>
          <Separator className="my-3" />
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

        <div className="p-4 text-xs text-muted-foreground opacity-70 border-t border-border">
          &copy; {new Date().getFullYear()} Project Completion Tracker
        </div>
      </aside>
      <main className="flex-1 p-8 bg-background text-foreground min-h-screen">{children}</main>
    </div>
  );
} 