import React, { useMemo } from 'react';
import { Agent, Client, Policy } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AgentPerformanceDetailProps {
  agent: Agent;
  policies: Policy[];
  clients: Client[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const AgentPerformanceDetail: React.FC<AgentPerformanceDetailProps> = ({ agent, policies, clients }) => {

  const performanceData = useMemo(() => {
    const agentClientIds = clients
      .filter(c => c.agentId === agent.id)
      .map(c => c.id);

    const agentPolicies = policies.filter(p => agentClientIds.includes(p.clientId));

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      policiesSold: 0,
      totalAP: 0,
      commissionEarned: 0,
    }));

    agentPolicies.forEach(policy => {
      const monthIndex = new Date(policy.startDate).getMonth();
      if (monthlyData[monthIndex]) {
        monthlyData[monthIndex].policiesSold += 1;
        monthlyData[monthIndex].totalAP += policy.annualPremium;
        monthlyData[monthIndex].commissionEarned += policy.annualPremium * agent.commissionRate;
      }
    });

    return monthlyData;
  }, [agent, policies, clients]);

  const hasData = performanceData.some(d => d.policiesSold > 0);

  return (
    <div className="bg-white p-6 rounded-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Monthly Performance for {agent.name}</h3>
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Year-to-Date Summary</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Month</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Policies Sold</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Total AP</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {performanceData.map(data => (
                    <tr key={data.month} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium">{data.month}</td>
                      <td className="px-4 py-2 text-right">{data.policiesSold}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(data.totalAP)}</td>
                      <td className="px-4 py-2 text-right text-emerald-600 font-medium">{formatCurrency(data.commissionEarned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Performance Chart</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" label={{ value: 'Policies Sold', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Total AP', angle: 90, position: 'insideRight' }} tickFormatter={formatCurrency} />
                <Tooltip formatter={(value, name) => name === 'totalAP' ? formatCurrency(Number(value)) : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="policiesSold" name="Policies Sold" fill="#4f46e5" />
                <Bar yAxisId="right" dataKey="totalAP" name="Total AP" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">
          No policy data available for this agent for the current year.
        </div>
      )}
    </div>
  );
};

export default AgentPerformanceDetail;
