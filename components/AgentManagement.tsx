import React, { useState, useMemo } from 'react';
import { Agent, AgentStatus, User, UserRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import ApproveAgentModal from './ApproveAgentModal';

interface AgentManagementProps {
  agents: Agent[];
  users: User[];
  onNavigate: (view: string) => void;
  onAddAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onApproveAgent: (agentId: number, newRole: UserRole) => void;
  onDeactivateAgent: (agentId: number) => void;
  onReactivateAgent: (agentId: number) => void;
  onRejectAgent: (agentId: number) => void;
  onDeleteAgent: (agentId: number) => void;
  highlightedAgentId: number | null;
}

const AgentManagement: React.FC<AgentManagementProps> = ({ agents, users, onNavigate, onAddAgent, onEditAgent, onApproveAgent, onDeactivateAgent, onReactivateAgent, onRejectAgent, onDeleteAgent, highlightedAgentId }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'inactive'>('active');
  const [agentToApprove, setAgentToApprove] = useState<Agent | null>(null);

  // Group agents by status in a single pass for efficiency and clarity.
  const { activeAgents, pendingAgents, inactiveAgents } = useMemo(() => {
    const grouped = {
      [AgentStatus.ACTIVE]: [] as Agent[],
      [AgentStatus.PENDING]: [] as Agent[],
      [AgentStatus.INACTIVE]: [] as Agent[],
    };

    agents.forEach(agent => {
      if (grouped[agent.status]) {
          grouped[agent.status].push(agent);
      }
    });

    return {
      activeAgents: grouped[AgentStatus.ACTIVE],
      pendingAgents: grouped[AgentStatus.PENDING],
      inactiveAgents: grouped[AgentStatus.INACTIVE],
    };
  }, [agents]);
  
  const userForApproval = users.find(u => u.id === agentToApprove?.id);

  const TabButton: React.FC<{tabId: 'active' | 'pending' | 'inactive', label: string, count: number}> = ({ tabId, label, count }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${activeTab === tabId ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
    >
      {label} <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">{count}</span>
    </button>
  );

  const ActionButton: React.FC<{ onClick: () => void, text: string, color: 'emerald' | 'amber' | 'rose' | 'slate', ariaLabel: string }> = ({ onClick, text, color, ariaLabel }) => {
      const colorClasses = {
          emerald: 'text-emerald-600 hover:text-emerald-800',
          amber: 'text-amber-600 hover:text-amber-800',
          rose: 'text-rose-600 hover:text-rose-800',
          slate: 'text-slate-500 hover:text-primary-600'
      };
      return (
        <button 
            onClick={onClick} 
            className={`font-medium ${colorClasses[color]} transition-colors`}
            aria-label={ariaLabel}
        >
            {text}
        </button>
      );
  };

  const ActiveAgentsTable = () => (
    <div className="bg-white rounded-b-lg rounded-tr-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Clients</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {activeAgents.map((agent) => (
              <tr key={agent.id} className={`transition-colors duration-1000 ${highlightedAgentId === agent.id ? 'bg-emerald-50' : 'hover:bg-slate-50'} row-enter`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={agent.avatar} alt={`${agent.name}'s avatar`} />
                    <div className="ml-4">
                      <button onClick={() => onNavigate(`agent/${agent.slug}`)} className="text-sm font-medium text-primary-600 hover:underline focus:outline-none">
                        {agent.name}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{agent.email}</div>
                  <div className="text-sm text-slate-500">{agent.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{agent.clientCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{(agent.commissionRate * 100).toFixed(0)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{agent.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButton
                        onClick={() => {
                            if (window.confirm('Are you sure you want to deactivate this agent? They will be moved to the Inactive list and will lose access to their dashboard.')) {
                                onDeactivateAgent(agent.id);
                                setActiveTab('inactive');
                            }
                        }}
                        text="Deactivate"
                        color="amber"
                        ariaLabel={`Deactivate ${agent.name}`}
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
  
  const InactiveAgentsTable = () => (
      <div className="bg-white rounded-b-lg rounded-tr-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {inactiveAgents.map((agent) => (
              <tr key={agent.id} className={`transition-colors duration-1000 ${highlightedAgentId === agent.id ? 'bg-rose-50' : 'hover:bg-slate-50'} row-enter`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={agent.avatar} alt={`${agent.name}'s avatar`} />
                    <div className="ml-4 font-medium text-slate-900">{agent.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{agent.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{agent.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                        <ActionButton
                            onClick={() => {
                                if (window.confirm('Reactivate this agent’s account? They will regain access immediately.')) {
                                    onReactivateAgent(agent.id);
                                    setActiveTab('active');
                                }
                            }}
                            text="Reactivate"
                            color="emerald"
                            ariaLabel={`Reactivate ${agent.name}`}
                        />
                         <ActionButton
                            onClick={() => {
                                if (window.confirm('Deleting this agent is permanent and cannot be undone. Proceed?')) {
                                    onDeleteAgent(agent.id);
                                }
                            }}
                            text="Delete"
                            color="rose"
                            ariaLabel={`Permanently Delete ${agent.name}`}
                        />
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );

  const PendingAgentsTable = () => (
     <div className="bg-white rounded-b-lg rounded-tr-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {pendingAgents.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-50 row-enter">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={agent.avatar} alt={`${agent.name}'s avatar`} />
                    <div className="ml-4 font-medium text-slate-900">{agent.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{agent.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{agent.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                        <ActionButton
                            onClick={() => setAgentToApprove(agent)}
                            text="Approve"
                            color="emerald"
                            ariaLabel={`Approve ${agent.name}`}
                        />
                        <button onClick={() => onEditAgent(agent)} className="text-slate-500 hover:text-primary-600 transition-colors p-1" aria-label={`Edit ${agent.name}`}>
                            <PencilIcon />
                        </button>
                        <ActionButton
                            onClick={() => {
                                if (window.confirm('Rejecting this application will move the agent to the Inactive list. Continue?')) {
                                    onRejectAgent(agent.id);
                                    setActiveTab('inactive');
                                }
                            }}
                            text="Reject"
                            color="rose"
                            ariaLabel={`Reject ${agent.name}`}
                        />
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">Agent Management</h1>
        <button onClick={onAddAgent} className="flex items-center bg-primary-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors button-press">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Agent
        </button>
      </div>
      
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <TabButton tabId="active" label="Active Agents" count={activeAgents.length} />
          <TabButton tabId="pending" label="Pending Applications" count={pendingAgents.length} />
          <TabButton tabId="inactive" label="Inactive Agents" count={inactiveAgents.length} />
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'active' && <ActiveAgentsTable />}
        {activeTab === 'pending' && <PendingAgentsTable />}
        {activeTab === 'inactive' && <InactiveAgentsTable />}
      </div>
      <ApproveAgentModal
        isOpen={!!agentToApprove}
        onClose={() => setAgentToApprove(null)}
        agentName={agentToApprove?.name || ''}
        currentRole={userForApproval?.role as UserRole.AGENT | UserRole.SUB_ADMIN || UserRole.AGENT}
        onConfirm={(newRole) => {
            if (agentToApprove) {
                onApproveAgent(agentToApprove.id, newRole);
                setAgentToApprove(null);
                setActiveTab('active');
            }
        }}
    />
    </div>
  );
};

export default AgentManagement;