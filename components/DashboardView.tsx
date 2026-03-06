
import React, { useEffect, useState } from 'react';
import { User, Transaction, TransactionType, TransactionStatus } from '../types';
import { Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis } from 'recharts';

interface DashboardViewProps {
  user: User;
  transactions: Transaction[];
}

const data = [
  { name: 'Mon', val: 4000 },
  { name: 'Tue', val: 3000 },
  { name: 'Wed', val: 5000 },
  { name: 'Thu', val: 4500 },
  { name: 'Fri', val: 6000 },
  { name: 'Sat', val: 5500 },
  { name: 'Sun', val: 7000 },
];

const DashboardView: React.FC<DashboardViewProps> = ({ user, transactions }) => {
  const [tvReachable, setTvReachable] = useState<boolean | null>(null);
  const [fallbackSeries, setFallbackSeries] = useState<Array<{ time: string; price: number }>>([]);
  const [fallbackError, setFallbackError] = useState<string>('');
  const userTransactions = transactions.filter(t => t.userId === user.id).slice(0, 5);

  useEffect(() => {
    let mounted = true;

    const timeout = window.setTimeout(() => {
      if (mounted) setTvReachable(false);
    }, 4500);

    fetch('https://s.tradingview.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        if (mounted) setTvReachable(true);
      })
      .catch(() => {
        if (mounted) setTvReachable(false);
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (tvReachable !== false) return;

    let mounted = true;
    const loadFallback = async () => {
      try {
        setFallbackError('');
        const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
        const apiBase = (viteEnv?.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
        let points: Array<{ ts: number; price: number }> = [];

        try {
          const res = await fetch(`${apiBase}/api/market/btc-history`);
          if (!res.ok) throw new Error('backend unavailable');
          const payload = (await res.json()) as { points?: Array<{ ts: number; price: number }> };
          points = Array.isArray(payload.points) ? payload.points : [];
        } catch {
          const res = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=3&interval=hourly');
          if (!res.ok) throw new Error('fallback provider unavailable');
          const payload = (await res.json()) as { prices?: Array<[number, number]> };
          const raw = Array.isArray(payload.prices) ? payload.prices : [];
          points = raw.map((p) => ({ ts: Number(p[0]), price: Number(p[1]) }));
        }

        const series = points.slice(-72).map((point) => ({
          time: new Date(point.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: point.price
        }));

        if (mounted) setFallbackSeries(series);
      } catch {
        if (mounted) setFallbackError('Live chart is unavailable on this network.');
      }
    };

    loadFallback();
    return () => {
      mounted = false;
    };
  }, [tvReachable]);

  const marketCoins = [
    { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      price: '94,231.02', 
      change: '+2.4%', 
      icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=040' 
    },
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      price: '2,431.15', 
      change: '-0.8%', 
      icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040' 
    },
    { 
      name: 'Solana', 
      symbol: 'SOL', 
      price: '143.55', 
      change: '+5.2%', 
      icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=040' 
    },
    { 
      name: 'Cardano', 
      symbol: 'ADA', 
      price: '0.45', 
      change: '+1.1%', 
      icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=040' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Balance Card */}
        <div className="glass border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h3 className="text-slate-400 mb-2">Total Portfolio Value</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold">${user.balance.toLocaleString()}</span>
              <span className="text-emerald-400 text-sm font-medium">+12.5% this month</span>
            </div>
            
            <div className="mt-8 h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold">Recent Transactions</h3>
            <button className="text-xs text-blue-400 hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-800">
            {userTransactions.length > 0 ? userTransactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 
                    tx.type === TransactionType.WITHDRAWAL ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <i className={`fas ${tx.type === TransactionType.DEPOSIT ? 'fa-arrow-down' : tx.type === TransactionType.WITHDRAWAL ? 'fa-arrow-up' : 'fa-rocket'}`}></i>
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type.toLowerCase()}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === TransactionType.DEPOSIT ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {tx.type === TransactionType.DEPOSIT ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <p className={`text-[10px] uppercase font-bold ${
                    tx.status === TransactionStatus.COMPLETED ? 'text-emerald-500' : tx.status === TransactionStatus.PENDING ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">No transactions yet.</div>
            )}
          </div>
        </div>

        {/* Live Prices */}
        <div className="glass border border-slate-800 rounded-2xl overflow-hidden">
           <div className="p-6 border-b border-slate-800">
             <h3 className="font-bold">Live BTC/USDT Chart</h3>
           </div>
           <div className="p-4 space-y-4">
             {tvReachable !== false && (
               <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                 <iframe
                   title="BTCUSDT TradingView Chart"
                   className="w-full"
                   style={{ height: 280, border: 0 }}
                   src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BINANCE:BTCUSDT&interval=60&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0f172a&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&locale=en"
                   scrolling="no"
                   allowFullScreen
                   onError={() => setTvReachable(false)}
                 />
               </div>
             )}
             {tvReachable === false && fallbackSeries.length > 0 && (
               <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                 <p className="text-xs text-amber-400 mb-2">TradingView unavailable. Showing fallback feed.</p>
                 <div className="h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={fallbackSeries}>
                       <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={28} />
                       <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
                       <Tooltip
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                         labelStyle={{ color: '#94a3b8' }}
                       />
                       <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             )}
             {tvReachable === false && fallbackSeries.length === 0 && !fallbackError && (
               <div className="rounded-xl border border-slate-800 bg-slate-950 h-56 flex items-center justify-center text-slate-500 text-sm">
                 Loading fallback chart...
               </div>
             )}
             {tvReachable === false && fallbackError && (
               <div className="rounded-xl border border-slate-800 bg-slate-950 h-56 flex items-center justify-center text-red-400 text-sm text-center px-4">
                 {fallbackError}
               </div>
             )}

             <div className="space-y-2">
               {marketCoins.map(coin => (
                 <div key={coin.symbol} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                   <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center p-2 border border-slate-800">
                        <img src={coin.icon} alt={coin.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{coin.name}</p>
                        <p className="text-xs text-slate-500">{coin.symbol}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-sm">${coin.price}</p>
                      <p className={`text-xs ${coin.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                        {coin.change}
                      </p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
