
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  if (!user) return <>{children}</>;

  const isAdmin = user.role === UserRole.ADMIN;

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'invest', label: 'Invest', icon: 'fa-rocket' },
    { id: 'transactions', label: 'Transactions', icon: 'fa-history' },
    { id: 'wallet', label: 'Wallet', icon: 'fa-wallet' },
    { id: 'ai-advisor', label: 'AI Advisor', icon: 'fa-brain' },
  ];

  const adminMenuItems = [
    { id: 'admin-overview', label: 'System Overview', icon: 'fa-shield-halved' },
    { id: 'admin-users', label: 'Manage Users', icon: 'fa-users' },
    { id: 'admin-tx', label: 'Approve Payments', icon: 'fa-check-double' },
    { id: 'admin-settings', label: 'Settings', icon: 'fa-cog' },
  ];

  // Filter out the 'invest' option for admins
  const filteredUserItems = isAdmin 
    ? userMenuItems.filter(item => item.id !== 'invest') 
    : userMenuItems;

  const items = isAdmin ? [...filteredUserItems, ...adminMenuItems] : userMenuItems;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            NEXUS CAPITAL
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-3 glass rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {user.fullName[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="h-16 glass border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="md:hidden font-bold text-blue-400">NEXUS</div>
          <div className="text-slate-400 text-sm hidden md:block">
            Market Status: <span className="text-emerald-400">Live</span>
          </div>
          <div className="flex items-center space-x-6">
             <div className="text-right">
                <p className="text-xs text-slate-500">Balance</p>
                <p className="text-lg font-bold text-white">${user.balance.toLocaleString()}</p>
             </div>
             <button className="p-2 glass rounded-lg hover:bg-slate-800 transition-colors">
               <i className="fas fa-bell"></i>
             </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
