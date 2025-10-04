import React from 'react';

interface SummaryCardProps {
  title: React.ReactNode;
  value: string;
  change?: string;
  icon: React.ReactNode;
  style?: React.CSSProperties;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, change, icon, style }) => {
  const isPositive = change && change.startsWith('+');
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all card-enter" style={style}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 font-semibold ${changeColor}`}>
              {change} this month
            </p>
          )}
        </div>
        <div className="bg-primary-100 text-primary-600 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
