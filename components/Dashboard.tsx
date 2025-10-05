import React, { useMemo } from 'react';
import SummaryCard from './SummaryCard';
import { ClientsIcon, DashboardIcon, TasksIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Client, Policy, PolicyType, Task, User, UserRole, Agent, ClientStatus } from '../types';
import AgentPerformanceDetail from './AgentPerformanceDetail';

interface DashboardProps {
    user: User;
    clients: Client[];
    policies: Policy[];
    tasks: Task[];
    agentsCount: number;
    agents: Agent[];
}

const AdminDashboard: React.FC<Pick<DashboardProps, 'clients' | 'policies' | 'agentsCount'>> = ({ clients, policies, agentsCount }) => {
    const totalPremium = policies.reduce((sum, p) => p.status === 'Active' ? sum + p.annualPremium : sum, 0);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard title="Total Clients" value={clients.length.toString()} change="+5" icon={<ClientsIcon className="w-8 h-8" />} style={{ animationDelay: '0.1s' }} />
            <SummaryCard title="Active Policies" value={policies.filter(p => p.status === 'Active').length.toString()} change="-2" icon={<DashboardIcon className="w-8 h-8" />} style={{ animationDelay: '0.2s' }}/>
            <SummaryCard title="Total Annual Premium" value={`$${(totalPremium / 1000).toFixed(1)}k`} change="+1.2k" icon={<DashboardIcon className="w-8 h-8" />} style={{ animationDelay: '0.3s' }}/>
            <SummaryCard title="Total Agents" value={agentsCount.toString()} change="+1" icon={<ClientsIcon className="w-8 h-8" />} style={{ animationDelay: '0.4s' }}/>
        </div>
    );
};

const AgentDashboard: React.FC<Pick<DashboardProps, 'clients' | 'policies' | 'tasks'>> = ({ clients, policies, tasks }) => {
    const totalPremium = policies.reduce((sum, p) => p.status === 'Active' ? sum + p.annualPremium : sum, 0);
    const openTasks = tasks.filter(t => !t.completed).length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard title="My Active Clients" value={clients.filter(c => c.status === 'Active').length.toString()} change="+2" icon={<ClientsIcon className="w-8 h-8" />} style={{ animationDelay: '0.1s' }} />
            <SummaryCard title="My Annual Premium" value={`$${(totalPremium / 1000).toFixed(1)}k`} change="+0.8k" icon={<DashboardIcon className="w-8 h-8" />} style={{ animationDelay: '0.2s' }}/>
            <SummaryCard title="Open Tasks" value={openTasks.toString()} icon={<TasksIcon className="w-8 h-8" />} style={{ animationDelay: '0.3s' }}/>
        </div>
    );
};

const SubAdminDashboard: React.FC<Pick<DashboardProps, 'clients'>> = ({ clients }) => {
    const newLeads = clients.filter(c => c.status === 'Lead').length;
    const unassignedLeads = clients.filter(c => c.status === 'Lead' && !c.agentId).length;
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard title="New Leads" value={newLeads.toString()} change="+3" icon={<ClientsIcon className="w-8 h-8" />} style={{ animationDelay: '0.1s' }} />
            <SummaryCard title="Unassigned Leads" value={unassignedLeads.toString()} icon={<ClientsIcon className="w-8 h-8" />} style={{ animationDelay: '0.2s' }}/>
            <SummaryCard title="Distribution Rate" value="85%" change="+5%" icon={<DashboardIcon className="w-8 h-8" />} style={{ animationDelay: '0.3s' }}/>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ user, clients, policies, tasks, agentsCount, agents }) => {

    const policiesByType = policies.reduce((acc, policy) => {
        acc[policy.type] = (acc[policy.type] || 0) + 1;
        return acc;
    }, {} as Record<PolicyType, number>);

    const pieData = Object.entries(policiesByType).map(([name, value]) => ({ name, value }));
    const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'];

    const clientStatusData = useMemo(() => {
        if (!clients) return [];
        const counts = clients.reduce((acc, client) => {
            acc[client.status] = (acc[client.status] || 0) + 1;
            return acc;
        }, {} as Record<ClientStatus, number>);

        return Object.values(ClientStatus).map(status => ({
            name: status,
            value: counts[status] || 0,
        })).filter(item => item.value > 0);
    }, [clients]);

    const STATUS_COLORS = {
        [ClientStatus.ACTIVE]: '#34d399', // emerald-400
        [ClientStatus.LEAD]: '#facc15', // amber-400
        [ClientStatus.INACTIVE]: '#fb7185', // rose-400
    };


    const salesData = [
        { name: 'Jan', premium: 4000 }, { name: 'Feb', premium: 3000 },
        { name: 'Mar', premium: 5000 }, { name: 'Apr', premium: 4500 },
        { name: 'May', premium: 6000 }, { name: 'Jun', premium: 5500 },
    ];

    const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 5);

    const currentAgent = user.role === UserRole.AGENT ? agents.find(a => a.id === user.id) : undefined;

    const renderSummaryCards = () => {
        switch (user.role) {
            case UserRole.ADMIN:
                return <AdminDashboard clients={clients} policies={policies} agentsCount={agentsCount} />;
            case UserRole.AGENT:
                return <AgentDashboard clients={clients} policies={policies} tasks={tasks} />;
            case UserRole.SUB_ADMIN:
                return <SubAdminDashboard clients={clients} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8">{user.role} Dashboard</h1>
            {renderSummaryCards()}

            {user.role === UserRole.AGENT && currentAgent && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8 card-enter" style={{ animationDelay: '0.5s' }}>
                    <AgentPerformanceDetail agent={currentAgent} policies={policies} clients={clients} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-slate-200 card-enter" style={{ animationDelay: '0.6s' }}>
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Monthly Premiums</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="premium" fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 card-enter" style={{ animationDelay: '0.7s' }}>
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Policies by Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((+(percent || 0)) * 100).toFixed(0)}%`}>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className={`grid grid-cols-1 ${user.role === UserRole.ADMIN ? 'lg:grid-cols-2' : ''} gap-6`}>
                <div className="bg-white p-6 rounded-lg border border-slate-200 card-enter" style={{ animationDelay: '0.8s' }}>
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Upcoming Tasks</h2>
                    <ul className="divide-y divide-slate-200">
                        {upcomingTasks.map(task => (
                            <li key={task.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-800">{task.title}</p>
                                    <p className="text-sm text-slate-500">Due: {task.dueDate}</p>
                                </div>
                                {task.clientId && <button className="text-sm text-primary-600 hover:underline">View Client</button>}
                            </li>
                        ))}
                    </ul>
                </div>
                {user.role === UserRole.ADMIN && (
                    <div className="bg-white p-6 rounded-lg border border-slate-200 card-enter" style={{ animationDelay: '0.9s' }}>
                        <h2 className="text-xl font-bold text-slate-700 mb-4">Client Status Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={clientStatusData} 
                                    cx="50%" 
                                    cy="50%" 
                                    labelLine={false} 
                                    outerRadius={100} 
                                    fill="#8884d8" 
                                    dataKey="value" 
                                    nameKey="name" 
                                    label={({ name, percent }) => `${name} ${((+(percent || 0)) * 100).toFixed(0)}%`}
                                >
                                    {clientStatusData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name as ClientStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} clients`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;