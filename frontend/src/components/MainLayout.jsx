import { Link, useLocation } from 'react-router-dom';
import { Users, Plus, Building2, BarChart3, ClipboardCheck } from 'lucide-react';
import { Button } from "@/components/ui/button"

const navItems = [
  { to: '/teams', label: 'Teams', icon: <Users className="w-5 h-5" /> },
  { to: '/teams/add', label: 'Add Team', icon: <Plus className="w-5 h-5" /> },
  { to: '/departments', label: 'Departments', icon: <Building2 className="w-5 h-5" /> },
  { to: '/statistics', label: 'Statistics', icon: <BarChart3 className="w-5 h-5" /> },
];

export default function MainLayout({ children }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 bg-card text-card-foreground flex flex-col shadow-lg border-r">
        <div className="flex items-center gap-2 p-6 text-2xl font-extrabold tracking-tight">
          <ClipboardCheck className="w-8 h-8" />
          <span>Project Tracker</span>
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
        <div className="mt-auto p-4 text-xs text-muted-foreground opacity-70">&copy; {new Date().getFullYear()} Project Tracker</div>
      </aside>
      <main className="flex-1 p-8 bg-background min-h-screen text-foreground">{children}</main>
    </div>
  );
} 