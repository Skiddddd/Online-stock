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
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'invest', label: 'Invest', icon: 'fa-rocket' },
    { id: 'transactions', label: 'Transactions', icon: 'fa-star' },
    { id: 'wallet', label: 'Wallet', icon: 'fa-folder' },
    { id: 'ai-advisor', label: 'AI Advisor', icon: 'fa-magnifying-glass' }
  ];

  const adminMenuItems = [
    { id: 'admin-overview', label: 'Overview', icon: 'fa-shield-halved' },
    { id: 'admin-users', label: 'Users', icon: 'fa-users' },
    { id: 'admin-tx', label: 'Approvals', icon: 'fa-check-double' },
    { id: 'admin-settings', label: 'Settings', icon: 'fa-gear' }
  ];

  const filteredUserItems = isAdmin ? userMenuItems.filter((item) => item.id !== 'invest') : userMenuItems;
  const items = isAdmin ? [...filteredUserItems, ...adminMenuItems] : userMenuItems;

  return (
    <div className="min-h-screen bg-[#e7e7ea] p-2 md:p-8 flex items-center justify-center text-white">
      <div className="w-full max-w-[1320px] h-[86vh] min-h-[680px] rounded-[18px] overflow-hidden shadow-[0_22px_70px_rgba(8,8,25,0.34)] border border-violet-950/50 bg-[#120028] flex">
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-[78px] bg-[#1a0038] border-b border-violet-900/50 px-5 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <button className="text-violet-200/90 hover:text-white" aria-label="Menu">
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <div className="hidden sm:flex items-center h-10 bg-white rounded-full px-4 min-w-[260px] md:min-w-[360px]">
                <i className="fas fa-search text-amber-500 text-xs mr-3"></i>
                <input className="w-full text-sm text-slate-700 bg-transparent outline-none" placeholder="Search" aria-label="Search" />
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="text-sm text-violet-200/85">Hello,</p>
              <p className="text-[38px] md:text-[42px] font-black">Welcome!!</p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>

        <aside className="w-[120px] md:w-[190px] bg-[#020b16] border-l border-violet-900/50 flex flex-col items-center py-8 px-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white text-orange-500 flex items-center justify-center text-5xl">
              <i className="fas fa-user-circle"></i>
            </div>
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#020b16]">1</span>
          </div>

          <div className="mt-4 text-center">
            <p className="text-3xl md:text-[36px] font-semibold leading-none">John Doe</p>
            <p className="text-slate-400 text-sm mt-1">{isAdmin ? 'Admin' : 'User'}</p>
          </div>

          <nav className="mt-8 flex-1 flex flex-col items-center gap-5 overflow-y-auto w-full">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-11 h-11 rounded-md flex items-center justify-center transition ${
                  activeTab === item.id ? 'bg-orange-500 text-white' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <i className={`fas ${item.icon}`}></i>
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="mt-4 w-11 h-11 rounded-md flex items-center justify-center text-white/90 hover:bg-red-500/20"
            title="Logout"
          >
            <i className="fas fa-right-from-bracket"></i>
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Layout;
