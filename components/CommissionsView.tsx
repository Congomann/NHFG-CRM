import React from 'react';
import { User, Agent, Policy, Client, UserRole, PolicyType } from '../types';
import SummaryCard from './SummaryCard';
import { DollarSignIcon, ShieldIcon, InfoIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import AgentPerformanceChart from './AgentPerformanceChart';
import { INSURANCE_CARRIERS } from '../constants';

interface CommissionsViewProps {
  currentUser: User;
  agents: Agent[];
  policies: Policy[];
  clients: Client[];
  onUpdatePolicy: (policyId: number, updates: Partial<Omit<Policy, 'id'>>) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

const InfoTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {text}
        </div>
    </div>
);

// Agent-specific view props
interface AgentCommissionsProps {
    agent: Agent;
    policies: Policy[];
    clients: Client[];
    onUpdatePolicy: (policyId: number, updates: Partial<Omit<Policy, 'id'>>) => void;
}


// Agent-specific view
const AgentCommissions: React.FC<AgentCommissionsProps> = ({ policies, clients, agent, onUpdatePolicy }) => {
    const agentClientIds = clients.filter(c => c.agentId === agent.id).map(c => c.id);
    const agentPolicies = policies.filter(p => agentClientIds.includes(p.clientId) && p.status === 'Active');

    const totalPremium = agentPolicies.reduce((sum, p) => sum + p.annualPremium, 0);
    const totalCommission = totalPremium * agent.commissionRate;

    const commissionByPolicyType = agentPolicies.reduce((acc, policy) => {
        const commission = policy.annualPremium * agent.commissionRate;
        acc[policy.type] = (acc[policy.type] || 0) + commission;
        return acc;
    }, {} as Record<PolicyType, number>);

    const chartData = Object.entries(commissionByPolicyType).map(([name, value]) => ({ name, Commission: value }));
    const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'];


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard title="Total AP Sold" value={formatCurrency(totalPremium)} icon={<ShieldIcon className="w-8 h-8" />} />
                <SummaryCard 
                    title={
                        <div className="flex items-center">
                            Your Commission Rate
                            <InfoTooltip text="This is the percentage of the Annual Premium (AP) you earn as commission for each policy you sell.">
                                <InfoIcon className="w-4 h-4 ml-2 text-slate-400" />
                            </InfoTooltip>
                        </div>
                    } 
                    value={`${(agent.commissionRate * 100)}%`} 
                    icon={<DollarSignIcon className="w-8 h-8" />} 
                />
                <SummaryCard title="Total Commission Earned" value={formatCurrency(totalCommission)} icon={<DollarSignIcon className="w-8 h-8" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Commission Breakdown by Policy</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Policy Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Policy Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Carrier</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Annual Premium</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Commission Earned</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {agentPolicies.map(policy => (
                                    <tr key={policy.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{policy.policyNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                             <select
                                                value={policy.type}
                                                onChange={(e) => onUpdatePolicy(policy.id, { type: e.target.value as PolicyType })}
                                                className="w-full p-1 border border-slate-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                {Object.values(PolicyType).map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <select
                                                value={policy.carrier || ''}
                                                onChange={(e) => onUpdatePolicy(policy.id, { carrier: e.target.value })}
                                                className="w-full p-1 border border-slate-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="">Select Carrier</option>
                                                {INSURANCE_CARRIERS.map(carrier => <option key={carrier} value={carrier}>{carrier}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatCurrency(policy.annualPremium)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{formatCurrency(policy.annualPremium * agent.commissionRate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Commissions by Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => formatCurrency(Number(value))} />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Bar dataKey="Commission" fill="#4f46e5">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}

// Admin-specific view
const AdminCommissions: React.FC<Omit<CommissionsViewProps, 'currentUser' | 'onUpdatePolicy'>> = ({ agents, policies, clients }) => {
    const agentData = agents.map(agent => {
        const agentClientIds = clients.filter(c => c.agentId === agent.id).map(c => c.id);
        const agentPolicies = policies.filter(p => agentClientIds.includes(p.clientId) && p.status === 'Active');
        const totalPremium = agentPolicies.reduce((sum, p) => sum + p.annualPremium, 0);
        const overrideEarned = totalPremium * (1 - agent.commissionRate);
        return {
            ...agent,
            totalPremium,
            overrideEarned
        };
    });

    const totalAgencyPremium = agentData.reduce((sum, a) => sum + a.totalPremium, 0);
    const totalOverride = agentData.reduce((sum, a) => sum + a.overrideEarned, 0);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <SummaryCard title="Total Agency AP" value={formatCurrency(totalAgencyPremium)} icon={<ShieldIcon className="w-8 h-8" />} />
                <SummaryCard title="Total Override Earned" value={formatCurrency(totalOverride)} icon={<DollarSignIcon className="w-8 h-8" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Agent Performance Breakdown</h2>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Agent Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                                        <div className="flex items-center">
                                            Commission Rate
                                            <InfoTooltip text="The percentage of AP paid to the agent. The remainder is the override commission for the agency.">
                                                <InfoIcon className="w-4 h-4 ml-1 text-slate-400" />
                                            </InfoTooltip>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total AP Sold</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Override Commission Earned</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {agentData.map(agent => (
                                    <tr key={agent.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{agent.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{agent.commissionRate * 100}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatCurrency(agent.totalPremium)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{formatCurrency(agent.overrideEarned)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Agent Performance Overview</h2>
                    <AgentPerformanceChart data={agentData} />
                </div>
            </div>
        </>
    );
};


const CommissionsView: React.FC<CommissionsViewProps> = ({ currentUser, agents, policies, clients, onUpdatePolicy }) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Commissions Dashboard</h1>
      {currentUser.role === UserRole.AGENT ? (
        (() => {
          const agent = agents.find(a => a.id === currentUser.id);
          if (!agent) {
            return <div className="p-4 bg-rose-100 text-rose-700 rounded-lg">Error: Your agent profile could not be found. You may have been removed from the system.</div>;
          }
          return <AgentCommissions agent={agent} policies={policies} clients={clients} onUpdatePolicy={onUpdatePolicy} />;
        })()
      ) : (
        <AdminCommissions agents={agents} policies={policies} clients={clients} />
      )}
    </div>
  );
};

export default CommissionsView;