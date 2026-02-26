
import React, { useState, useEffect, useCallback } from 'react';
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Withdrawal State
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[150px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">NEXUS CAPITAL</h1>
            <p className="text-slate-500">Institutional Grade Crypto Investing</p>
          </div>

          <div className="glass border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{isRegistering ? 'Start Investing' : 'Login'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
              >
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-600">
            <p>Admin Email: admin@nexus.io</p>
            <p className="mt-2">&copy; 2024 Nexus Crypto Capital. Secured by Blockchain.</p>
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
