
import React, { useState } from 'react';
import { User, InvestmentPlan, TransactionType } from '../types';

interface InvestViewProps {
  user: User;
  plans: InvestmentPlan[];
  onInvest: (planId: string, amount: number) => void;
}

const InvestView: React.FC<InvestViewProps> = ({ user, plans, onInvest }) => {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleInvest = () => {
    if (!selectedPlan) return;
    if (amount < selectedPlan.minAmount) {
      setError(`Minimum investment for this plan is $${selectedPlan.minAmount}`);
      return;
    }
    if (amount > selectedPlan.maxAmount) {
      setError(`Maximum investment for this plan is $${selectedPlan.maxAmount}`);
      return;
    }
    if (amount > user.balance) {
      setError(`Insufficient balance. Please deposit funds first.`);
      return;
    }
    onInvest(selectedPlan.id, amount);
    setSelectedPlan(null);
    setAmount(0);
    setError('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Investment Tiers</h2>
        <p className="text-slate-400">Choose a high-yield plan curated by our automated trading algorithms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className={`glass border rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
            selectedPlan?.id === plan.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800'
          }`}>
            <div className="mb-6">
               <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
               <div className="text-3xl font-bold text-blue-400">{plan.dailyRoi}% <span className="text-sm text-slate-500 font-normal">Daily ROI</span></div>
            </div>
            
            <div className="space-y-4 mb-8 flex-1">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Min Investment</span>
                 <span className="text-white font-medium">${plan.minAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Max Investment</span>
                 <span className="text-white font-medium">${plan.maxAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Duration</span>
                 <span className="text-white font-medium">{plan.durationDays} Days</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Payout</span>
                 <span className="text-emerald-400 font-medium">Automatic</span>
               </div>
            </div>

            <button 
              onClick={() => setSelectedPlan(plan)}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                selectedPlan?.id === plan.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Confirm Investment</h3>
            <p className="text-slate-400 mb-6">You are subscribing to the <span className="text-blue-400 font-bold">{selectedPlan.name}</span>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Amount to Invest (USD)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={`Min $${selectedPlan.minAmount.toLocaleString()}`}
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="py-3 px-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleInvest}
                className="py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              >
                Start Investment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestView;
