
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, TransactionStatus, TransactionType, UserRole, SystemConfig } from './types';
import { storageService } from './services/storageService';
import { REMEMBERED_EMAIL_KEY } from './constants';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import InvestView from './components/InvestView';
import AdminView from './components/AdminView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(storageService.getState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

 = useRef<HTMLDivElement | null>(null);

  const scrollToAuthCard = useCallback(() => {
    requestAnimationFrame(() => {
      authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);


  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Sync state with storage helper
  const refreshState = useCallback(() => {
    setState(storageService.getState());
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      let authSuccessful = false;
      if (isRegistering) {
        storageService.register(name, email);
        authSuccessful = true;
      } else {
        const user = storageService.login(email);
        if (user) {
          authSuccessful = true;
        } else {
          alert("User not found. Please register.");
        }
      }

      if (authSuccessful) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        refreshState();
      }
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    storageService.logout();
    refreshState();
    setActiveTab('dashboard');
  };

  const handleInvest = (planId: string, amount: number) => {
    if (!state.currentUser) return;
    storageService.createTransaction(state.currentUser.id, TransactionType.INVESTMENT, amount, 'Investment Wallet');
    refreshState();
    alert("Investment plan requested. Admin will approve shortly.");
  };

  const handleUpdateStatus = (txId: string, status: TransactionStatus) => {
    storageService.updateTransactionStatus(txId, status);
    refreshState();
  };

  const handleUpdateConfig = (config: SystemConfig) => {
    storageService.updateSystemConfig(config);
    refreshState();
  };

  const handleSetUserBalance = (userId: string, nextBalance: number) => {
    storageService.setUserBalance(userId, nextBalance);
    refreshState();
  };

  const handleQuickDeposit = () => {
    if (!state.currentUser) return;
    const amount = Number(prompt("Enter amount to deposit (USD equivalent):", "5000"));
    if (amount > 0) {
      storageService.createTransaction(state.currentUser.id, TransactionType.DEPOSIT, amount, 'Crypto Transfer');
      refreshState();
      alert("Deposit request submitted successfully. Please ensure you have transferred the funds to the platform addresses provided below.");
    }
  };

  const handleWithdraw = () => {
    if (!state.currentUser) return;
    if (withdrawAmount <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (withdrawAmount > state.currentUser.balance) {
      setWithdrawError('Insufficient balance.');
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a destination address.');
      return;
    }

    storageService.createTransaction(
      state.currentUser.id, 
      TransactionType.WITHDRAWAL, 
      withdrawAmount, 
      `To: ${withdrawAddress.substring(0, 8)}...`
    );
    
    setShowWithdrawModal(false);
    setWithdrawAmount(0);
    setWithdrawAddress('');
    setWithdrawError('');
    refreshState();
    alert("Withdrawal request submitted. Our finance team will process it shortly.");
  };

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-[#020b23] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(45,212,191,0.2),transparent_40%),radial-gradient(circle_at_85%_25%,rgba(59,130,246,0.22),transparent_42%),linear-gradient(120deg,#020617_0%,#071945_45%,#031126_100%)]"></div>
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-cyan-400/20 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-0 -right-24 w-[28rem] h-[28rem] bg-blue-500/15 blur-[160px] rounded-full"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full border-[3px] border-slate-200/90 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 text-slate-200" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth={4} />
      <rect x="15" y="24" width="4" height="10" rx="1" fill="#34d399" />
      <rect x="22" y="18" width="4" height="16" rx="1" fill="#2dd4bf" />
      <rect x="29" y="14" width="4" height="20" rx="1" fill="#22c55e" />
    </svg>
  </div>
  <div className="leading-[1.05]">
    <div className="text-slate-100 font-extrabold text-lg md:text-xl tracking-tight">Online</div>
    <div className="text-slate-200 font-semibold text-sm md:text-base tracking-tight">stock broking</div>
  </div>
</div>
            <div className="hidden md:flex items-center gap-3 text-sm text-slate-300">
              <span className="px-3 py-2">Market</span>
              <span className="px-3 py-2">Security</span>
              <span className="px-3 py-2">Support</span>
              <span className="px-3 py-2">Pricing</span>
            </div>
          </header>

          <main className="mt-10 grid lg:grid-cols-2 gap-10 items-center">
            <section>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">Invest Smarter</h1>
              <p className="mt-5 text-slate-300 max-w-xl text-lg leading-relaxed">
                Build long-term crypto wealth on a secure platform with clear portfolio tracking, advanced tools, and fast execution.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    scrollToAuthCard();
                  }}
                  className="px-8 py-3 rounded-2xl text-lg font-semibold bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-900 shadow-[0_14px_45px_rgba(45,212,191,0.35)] hover:brightness-110 transition"
                >
                  Invest now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    scrollToAuthCard();
                  }}
                  className="px-7 py-3 rounded-2xl text-lg font-semibold border border-cyan-300/35 text-cyan-100 hover:bg-cyan-400/10 transition"
                >
                  Sign In
                </button>
              </div>
            </section>

            <section className="relative">
              <div className="hidden md:block absolute -top-20 right-10 w-72 h-72 rounded-full border border-cyan-300/40 bg-cyan-300/10 blur-[1px]"></div>
              <div className="hidden md:block absolute -top-8 right-20 w-52 h-52 rounded-full bg-gradient-to-b from-cyan-300/20 to-transparent shadow-[0_0_80px_rgba(34,211,238,0.35)]"></div>

              <div ref={authCardRef} className="glass border border-cyan-200/20 rounded-3xl p-6 md:p-8 backdrop-blur-md bg-slate-950/45 shadow-[0_25px_90px_rgba(8,47,73,0.7)]">
                <h2 className="text-2xl font-bold mb-1">{isRegistering ? 'Create Account' : 'Sign In'}</h2>
                <p className="text-slate-300 text-sm mb-6">
                  {isRegistering ? 'Join the platform and start investing today.' : 'Access your dashboard and portfolio instantly.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                  {isRegistering && (
                    <div>
                      <label className="block text-sm font-medium text-cyan-100/85 mb-2">Full Name</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900/75 border border-cyan-300/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400/60 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-cyan-100/85 mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/75 border border-cyan-300/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-400/60 outline-none transition-all"
                      placeholder="name@company.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-base font-bold bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-900 shadow-[0_14px_40px_rgba(45,212,191,0.35)] hover:brightness-110 transition flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                    ) : (
                      <span>{isRegistering ? 'Create My Account' : 'Login'}</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-sm text-cyan-200/90 hover:text-cyan-100 transition-colors"
                  >
                    {isRegistering ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            </section>
          </main>

          <section className="mt-12 grid md:grid-cols-3 gap-5">
            <article className="glass border border-cyan-200/15 rounded-2xl p-6 bg-slate-950/40">
              <p className="text-cyan-300 text-sm font-semibold">Invest Security</p>
              <h3 className="mt-3 text-2xl font-bold">Asset Protection</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">Enterprise controls and monitored wallets keep your investments protected around the clock.</p>
            </article>
            <article className="glass border border-cyan-200/15 rounded-2xl p-6 bg-slate-950/40">
              <p className="text-cyan-300 text-sm font-semibold">Investing Engine</p>
              <h3 className="mt-3 text-2xl font-bold">Smarter Strategy</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">Use structured plans, transparent returns, and fast execution to grow your crypto portfolio.</p>
            </article>
            <article className="glass border border-cyan-200/15 rounded-2xl p-6 bg-slate-950/40">
              <p className="text-cyan-300 text-sm font-semibold">Client Wallet</p>
              <h3 className="mt-3 text-2xl font-bold">Flexible Funding</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">Fund accounts quickly, track balances in real time, and submit withdrawals with confidence.</p>
            </article>
          </section>

          <div className="mt-8 text-center text-xs text-slate-400">
            <p>Admin Email: admin@nexus.io</p>
            <p className="mt-2">&copy; 2026 Nexus Crypto Capital. Secured by Blockchain.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={state.currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && (
        <DashboardView user={state.currentUser} transactions={state.transactions} />
      )}
      
      {activeTab === 'invest' && (
        <InvestView user={state.currentUser} plans={state.plans} onInvest={handleInvest} />
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-8">
           <h2 className="text-3xl font-bold">Funding & Wallet</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass border border-slate-800 p-8 rounded-3xl">
                 <h3 className="text-xl font-bold mb-4">Deposit Funds</h3>
                 <p className="text-slate-400 mb-6 text-sm">Transfer assets to the platform addresses below. Your account balance will be updated after admin confirmation.</p>
                 
                 <div className="space-y-4 mb-8">
                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                       <div className="flex items-center space-x-2 mb-2">
                          <i className="fab fa-bitcoin text-orange-500"></i>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform BTC Address</span>
                       </div>
                       <code className="block text-[10px] md:text-xs text-blue-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                          {state.systemConfig.btcAddress}
                       </code>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                       <div className="flex items-center space-x-2 mb-2">
                          <i className="fab fa-ethereum text-blue-400"></i>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform ETH Address</span>
                       </div>
                       <code className="block text-[10px] md:text-xs text-blue-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                          {state.systemConfig.ethAddress}
                       </code>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                       <div className="flex items-center space-x-2 mb-2">
                          <i className="fas fa-dollar-sign text-emerald-500"></i>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform USDT Address</span>
                       </div>
                       <code className="block text-[10px] md:text-xs text-blue-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                          {state.systemConfig.usdtAddress}
                       </code>
                    </div>
                 </div>

                 <button 
                   onClick={handleQuickDeposit}
                   className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all"
                 >
                   I've Made a Transfer
                 </button>
                 <p className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-tighter italic">Official Deposit Addresses. Sending any other tokens may result in permanent loss.</p>
              </div>
              <div className="glass border border-slate-800 p-8 rounded-3xl self-start">
                 <h3 className="text-xl font-bold mb-4">Withdraw Profits</h3>
                 <p className="text-slate-400 mb-6 text-sm">Withdraw your earnings directly to your external wallet. Ensure your wallet address is correct.</p>
                 <button 
                   onClick={() => setShowWithdrawModal(true)}
                   className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                 >
                   Request Withdrawal
                 </button>
                 <p className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-tighter italic">Note: Standard processing time is 1-24 hours for security audits.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
           <h2 className="text-3xl font-bold">Deposit History</h2>
           <div className="glass border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {state.transactions
                    .filter(t => t.userId === state.currentUser?.id && t.type === TransactionType.DEPOSIT)
                    .map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">#{tx.id}</td>
                      <td className="px-6 py-4 text-slate-400">{tx.method}</td>
                      <td className="px-6 py-4 font-bold">${tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          tx.status === TransactionStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500' : 
                          tx.status === TransactionStatus.PENDING ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {state.transactions.filter(t => t.userId === state.currentUser?.id && t.type === TransactionType.DEPOSIT).length === 0 && (
                <div className="p-12 text-center text-slate-500">No deposits found.</div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'ai-advisor' && (
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="text-center">
              <h2 className="text-4xl font-extrabold mb-4">Nexus AI Advisor</h2>
              <p className="text-slate-400">Personalized investment strategies powered by Gemini 3.0 Pro.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                   <i className="fas fa-brain text-white text-2xl"></i>
                 </div>
                 <h3 className="text-xl font-bold mb-2">Portfolio Audit</h3>
                 <p className="text-sm text-slate-500 mb-6">Analyze your current balance and risk profile to get a custom investment roadmap.</p>
                 <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500">Generate Report</button>
              </div>
              <div className="glass border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-6">
                   <i className="fas fa-newspaper text-white text-2xl"></i>
                 </div>
                 <h3 className="text-xl font-bold mb-2">Alpha Insights</h3>
                 <p className="text-sm text-slate-500 mb-6">Daily digest of market movements and potential high-growth opportunities.</p>
                 <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500">Read Analysis</button>
              </div>
           </div>
        </div>
      )}

      {/* Admin Protected Views */}
      {state.currentUser.role === UserRole.ADMIN && (
        <>
          {activeTab === 'admin-overview' && (
            <AdminView users={state.users} transactions={state.transactions} onUpdateStatus={handleUpdateStatus} onSetUserBalance={handleSetUserBalance} systemConfig={state.systemConfig} onUpdateConfig={handleUpdateConfig} view="overview" />
          )}
          {activeTab === 'admin-users' && (
            <AdminView users={state.users} transactions={state.transactions} onUpdateStatus={handleUpdateStatus} onSetUserBalance={handleSetUserBalance} systemConfig={state.systemConfig} onUpdateConfig={handleUpdateConfig} view="users" />
          )}
          {activeTab === 'admin-tx' && (
            <AdminView users={state.users} transactions={state.transactions} onUpdateStatus={handleUpdateStatus} onSetUserBalance={handleSetUserBalance} systemConfig={state.systemConfig} onUpdateConfig={handleUpdateConfig} view="overview" />
          )}
          {activeTab === 'admin-settings' && (
            <AdminView users={state.users} transactions={state.transactions} onUpdateStatus={handleUpdateStatus} onSetUserBalance={handleSetUserBalance} systemConfig={state.systemConfig} onUpdateConfig={handleUpdateConfig} view="settings" />
          )}
        </>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">Withdraw Funds</h3>
            <p className="text-slate-400 mb-6 text-sm">Available Balance: <span className="text-emerald-400 font-bold">${state.currentUser?.balance.toLocaleString()}</span></p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Withdraw Amount (USD)</label>
                <div className="relative">
                   <span className="absolute left-4 top-3.5 text-slate-500">$</span>
                   <input 
                     type="number" 
                     value={withdrawAmount}
                     onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                     className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="0.00"
                   />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-2">Destination Wallet Address</label>
                <input 
                  type="text" 
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  placeholder="0x... or bc1q..."
                />
              </div>
              {withdrawError && <p className="text-red-400 text-sm">{withdrawError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawError('');
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                className="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
              >
                Confirm
              </button>
            </div>
            <p className="mt-6 text-[10px] text-slate-500 text-center leading-tight">By clicking confirm, you agree that Nexus Capital is not responsible for funds sent to incorrect wallet addresses.</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
