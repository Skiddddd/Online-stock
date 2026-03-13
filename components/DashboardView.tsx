import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { User, Transaction } from '../types';

interface DashboardViewProps {
  user: User;
  transactions: Transaction[];
}

const waveData = [
  { day: 'Mon', x: 45, y: 18, z: 28 },
  { day: 'Tue', x: 34, y: 24, z: 20 },
  { day: 'Wed', x: 29, y: 16, z: 26 },
  { day: 'Thu', x: 36, y: 21, z: 22 },
  { day: 'Fri', x: 24, y: 33, z: 30 },
  { day: 'Sat', x: 31, y: 28, z: 27 },
  { day: 'Sun', x: 42, y: 25, z: 34 }
];

const bars = [
  { title: 'TEXT TITLE', value: 64, color: 'bg-violet-400' },
  { title: 'TEXT TITLE', value: 58, color: 'bg-blue-400' },
  { title: 'TEXT TITLE', value: 61, color: 'bg-amber-300' },
  { title: 'TEXT TITLE', value: 60, color: 'bg-yellow-300' }
];

const DashboardView: React.FC<DashboardViewProps> = ({ user, transactions }) => {
  const recent = transactions.filter((t) => t.userId === user.id).slice(0, 3);

  return (
    <div className="space-y-5">
      <h2 className="text-[30px] font-bold"><span className="font-black">Dashboard:</span> Project Name</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 rounded-xl border border-violet-900/50 bg-[#1a0038] p-5 min-h-[260px]">
          <h3 className="text-[34px] font-semibold leading-none">Chart title here</h3>
          <p className="text-[11px] text-violet-200/70 mt-1">Lorem ipsum</p>

          <div className="h-[190px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waveData}>
                <defs>
                  <linearGradient id="softA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f9d8b0" stopOpacity={0.95} />
                    <stop offset="95%" stopColor="#f9d8b0" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="softB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bc7cff" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#bc7cff" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="softC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f55ff" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#2f55ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: '#13022c', border: '1px solid #4c1d95', borderRadius: 10 }}
                  labelStyle={{ color: '#ddd6fe' }}
                />
                <Area type="monotone" dataKey="x" stroke="#f9d8b0" fill="url(#softA)" strokeWidth={2} />
                <Area type="monotone" dataKey="y" stroke="#bc7cff" fill="url(#softB)" strokeWidth={2} />
                <Area type="monotone" dataKey="z" stroke="#2f55ff" fill="url(#softC)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-violet-900/50 bg-[#1a0038] p-5 min-h-[260px]">
          <h3 className="text-[34px] font-semibold leading-none">Chart title here</h3>
          <p className="text-[11px] text-violet-200/70 mt-1">Lorem ipsum</p>
          <div className="mt-8 space-y-5">
            {bars.map((b) => (
              <div key={`${b.title}-${b.value}`}>
                <p className="text-[11px] font-semibold text-white/90 mb-2">{b.title}</p>
                <div className="h-1.5 rounded-full bg-white/30 relative">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.value}%` }}></div>
                  <span className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border border-black/20" style={{ left: `calc(${b.value}% - 6px)` }}></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 rounded-xl border border-violet-900/50 bg-[#1a0038] p-5 min-h-[255px] relative overflow-hidden">
          <h3 className="text-[34px] font-semibold leading-none">Chart title here</h3>
          <p className="text-[11px] text-violet-200/70 mt-1">Lorem ipsum</p>
          <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_55%_62%,rgba(255,255,255,0.72),transparent_11%),linear-gradient(115deg,transparent_0%,#3f17a8_58%,#2f1a7b_100%)]"></div>
          <div className="absolute inset-x-0 top-1/2 border-t border-white/40"></div>
          <div className="absolute inset-y-0 left-1/2 border-l border-white/40"></div>
          <div className="absolute left-6 bottom-4 text-[90px] leading-none font-black text-white/10">WORLD</div>
        </section>

        <section className="rounded-xl border border-violet-900/50 bg-[#1a0038] p-5 min-h-[255px] flex flex-col justify-between">
          <div>
            <h3 className="text-[38px] leading-none font-semibold">Country name</h3>
            <ul className="mt-3 text-sm text-violet-100/85 list-disc list-inside space-y-1">
              <li>Lorem ipsum dolor sit amet.</li>
              <li>Consectetur adipiscing elit.</li>
              <li>Volutpat ut laoreet magna.</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 mt-5">
            <div className="w-28 h-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ca8bff_0%,#8f4cff_50%,#2b1b71_100%)] flex items-center justify-center text-5xl font-black">
              75%
            </div>
            <div>
              <p className="text-3xl font-semibold">Economical details</p>
              <p className="text-sm text-violet-200/80 mt-1">Balance: ${user.balance.toLocaleString()}</p>
              {recent.map((tx) => (
                <p key={tx.id} className="text-xs text-violet-100/80">{tx.type} - ${tx.amount.toLocaleString()}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardView;
