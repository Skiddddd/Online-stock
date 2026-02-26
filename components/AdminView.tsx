import React, { useState } from 'react';
import { User, Transaction, TransactionStatus, SystemConfig } from '../types';

interface AdminViewProps {
  users: User[];
  transactions: Transaction[];
  onUpdateStatus: (txId: string, status: TransactionStatus) => void;
  onSetUserBalance: (userId: string, nextBalance: number) => void;
  systemConfig: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
  view: 'overview' | 'users' | 'tx' | 'settings';
}

const AdminView: React.FC<AdminViewProps> = ({ users, transactions, onUpdateStatus, onSetUserBalance, systemConfig, onUpdateConfig, view }) => {
  const pendingTxs = transactions.filter(t => t.status === TransactionStatus.PENDING);
  const totalVolume = transactions.filter(t => t.status === TransactionStatus.COMPLETED).reduce((acc, t) => acc + t.amount, 0);

  const [localConfig, setLocalConfig] = useState<SystemConfig>(systemConfig);

  if (view === 'overview') {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">System Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="glass border border-slate-800 p-6 rounded-2xl">
             <p className="text-slate-500 text-sm mb-1">Total Users</p>
             <p className="text-3xl font-bold">{users.length}</p>
           </div>
           <div className="glass border border-slate-800 p-6 rounded-2xl">
             <p className="text-slate-500 text-sm mb-1">Total Volume</p>
             <p className="text-3xl font-bold">${totalVolume.toLocaleString()}</p>
           </div>
           <div className="glass border border-slate-800 p-6 rounded-2xl">
             <p className="text-slate-500 text-sm mb-1">Pending Tasks</p>
             <p className="text-3xl font-bold text-amber-400">{pendingTxs.length}</p>
           </div>
           <div className="glass border border-slate-800 p-6 rounded-2xl">
             <p className="text-slate-500 text-sm mb-1">System Health</p>
             <p className="text-3xl font-bold text-emerald-400">Stable</p>
           </div>
        </div>

        <div className="glass border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-bold">Needs Approval</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {pendingTxs.length > 0 ? pendingTxs.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{tx.userEmail}</p>
                  <p className="text-xs text-slate-500">{tx.type} via {tx.method} | {new Date(tx.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-lg">${tx.amount.toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onUpdateStatus(tx.id, TransactionStatus.COMPLETED)}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(tx.id, TransactionStatus.REJECTED)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-500 italic">Everything is up to date.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'users') {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="glass border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium">{u.fullName}</td>
                  <td className="px-6 py-4 text-slate-400">{u.email}</td>
                  <td className="px-6 py-4 font-bold text-white">${u.balance.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">ACTIVE</span>
                  </td>
                  <td className="px-6 py-4 text-xs">{u.role}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        const input = prompt(`Set new balance for ${u.fullName} (${u.email})`, String(u.balance));
                        if (input === null) return;
                        const parsed = Number(input);
                        if (!Number.isFinite(parsed) || parsed < 0) {
                          alert('Please enter a valid non-negative number.');
                          return;
                        }
                        onSetUserBalance(u.id, parsed);
                        alert('User balance updated.');
                      }}
                      className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                    >
                      Edit Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="space-y-8 max-w-2xl">
        <h2 className="text-3xl font-bold">System Settings</h2>
        <div className="glass border border-slate-800 p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold border-b border-slate-800 pb-4">Deposit Wallet Addresses</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2 font-medium">BTC Address (SegWit)</label>
              <input 
                type="text" 
                value={localConfig.btcAddress}
                onChange={(e) => setLocalConfig({...localConfig, btcAddress: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2 font-medium">ETH Address (ERC20)</label>
              <input 
                type="text" 
                value={localConfig.ethAddress}
                onChange={(e) => setLocalConfig({...localConfig, ethAddress: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2 font-medium">USDT Address (ERC20)</label>
              <input 
                type="text" 
                value={localConfig.usdtAddress}
                onChange={(e) => setLocalConfig({...localConfig, usdtAddress: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            </div>
          </div>

          <button 
            onClick={() => {
                onUpdateConfig(localConfig);
                alert("Platform deposit addresses updated successfully!");
            }}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminView;
