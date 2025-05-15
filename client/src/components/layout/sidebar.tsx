import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboardIcon, 
  MegaphoneIcon, 
  SparklesIcon, 
  UsersIcon, 
  BarChart3Icon, 
  WalletIcon
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  userRole: 'creator' | 'influencer';
}

export default function Sidebar({ activeTab, userRole }: SidebarProps) {

  // Navigation items based on role
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboardIcon className="text-xl mr-3" />,
      path: userRole === 'creator' ? '/creator' : '/influencer',
      active: activeTab === 'dashboard'
    }
  ];

  return (
    <aside className="bg-background border-r border-border hidden lg:block">
      <div className="h-full flex flex-col">
        <div className="px-4 py-6">

          
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <Link key={index} href={item.path}>
                <span className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg group cursor-pointer",
                  item.active 
                    ? "bg-primary bg-opacity-10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}>
                  {item.icon}
                  <span className={item.active ? "font-medium" : ""}>{item.name}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
        

      </div>
    </aside>
  );
}
