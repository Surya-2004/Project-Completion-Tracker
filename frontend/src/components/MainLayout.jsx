import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Plus, Building2, BarChart3, MessageSquare, LogOut, User, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const NavigationContent = () => (
    <>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Button
              key={item.to}
              asChild
              variant={active ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={closeMobileMenu}
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
          onClick={() => {
            handleLogout();
            closeMobileMenu();
          }}
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-blue-600">Project Tracker</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeMobileMenu} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card text-card-foreground flex flex-col shadow-lg border-r border-border transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 p-6 text-xl font-bold tracking-tight border-b border-border">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-blue-600">Project Tracker</span>
        </div>
        <NavigationContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-card text-card-foreground flex-col shadow-lg border-r border-border">
        <div className="flex items-center gap-3 p-6 text-xl font-bold tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-blue-600">Project Tracker</span>
        </div>
        <NavigationContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:p-8 bg-background text-foreground min-h-screen pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
} 