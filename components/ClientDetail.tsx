import React, { useState } from 'react';
import { Client, Policy, Interaction, PolicyStatus, InteractionType, Agent, User, UserRole, ClientStatus } from '../types';
import { summarizeNotes } from '../services/geminiService';
import { AiSparklesIcon, PlusIcon, PencilIcon, EllipsisVerticalIcon } from './icons';

interface ClientDetailProps {
  client: Client;
  policies: Policy[];
  interactions: Interaction[];
  assignedAgent?: Agent;
  onBack: () => void;
  currentUser: User;
  onUpdateStatus: (clientId: number, newStatus: ClientStatus) => void;
  onOpenAddPolicyModal: () => void;
  onOpenEditPolicyModal: (policy: Policy) => void;
  onUpdatePolicy: (policyId: number, updates: Partial<Policy>) => void;
}

const getPolicyStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE: return 'border-emerald-500';
      case PolicyStatus.EXPIRED: return 'border-amber-500';
      case PolicyStatus.CANCELLED: return 'border-rose-500';
    }
};

const getInteractionIcon = (type: InteractionType) => {
    switch(type) {
        case InteractionType.CALL: return '📞';
        case InteractionType.EMAIL: return '✉️';
        case InteractionType.MEETING: return '🤝';
        case InteractionType.NOTE: return '📝';
    }
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  const displayValue = (value !== null && value !== undefined && value !== '') ? value : <span className="text-slate-400 italic">Not Provided</span>;
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-md text-slate-800">{displayValue}</p>
    </div>
  );
};

const PolicyCard: React.FC<{ policy: Policy; onEdit: (policy: Policy) => void; onUpdatePolicy: (policyId: number, updates: Partial<Policy>) => void; }> = ({ policy, onEdit, onUpdatePolicy }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleStatusChange = (status: PolicyStatus) => {
        if (window.confirm(`Are you sure you want to mark this policy as ${status}?`)) {
            onUpdatePolicy(policy.id, { status });
        }
        setIsMenuOpen(false);
    }
    
    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border border-l-4 ${getPolicyStatusColor(policy.status)} relative group`}>
            <div className="absolute top-2 right-2">
                <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
                    className="p-1.5 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-primary-600 hover:text-white focus:opacity-100 transition-opacity z-10" 
                    aria-label="Policy Actions"
                    title="Policy Actions"
                >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 modal-panel">
                        <div className="py-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); onEdit(policy); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Edit Policy</a>
                            {policy.status === PolicyStatus.ACTIVE && (
                                <>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(PolicyStatus.CANCELLED); }} className="block px-4 py-2 text-sm text-rose-700 hover:bg-rose-50">Cancel Policy</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(PolicyStatus.EXPIRED); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Mark as Expired</a>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-primary-700">{policy.type} Insurance</h3>
                    <p className="text-sm text-slate-600 mt-1">Carrier: {policy.carrier || 'N/A'}</p>
                    <p className="text-sm text-slate-600 mt-1">Policy #: {policy.policyNumber}</p>
                </div>
                <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{policy.status}</span>
            </div>
            <div className="flex justify-between items-baseline mt-4">
                <div>
                    <p className="text-2xl font-semibold text-slate-800">${policy.monthlyPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm font-normal text-slate-500">/month</p>
                </div>
                <div>
                    <p className="text-lg font-medium text-slate-600">${policy.annualPremium.toLocaleString()}</p>
                    <p className="text-xs font-normal text-slate-500 text-right">/year</p>
                </div>
            </div>
            <p className="text-sm text-slate-500 mt-2 border-t pt-2">Effective: {policy.startDate} - {policy.endDate}</p>
        </div>
    );
};


const ClientDetail: React.FC<ClientDetailProps> = ({ client, policies, interactions, assignedAgent, onBack, currentUser, onUpdateStatus, onOpenAddPolicyModal, onOpenEditPolicyModal, onUpdatePolicy }) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'interactions' | 'notes'>('policies');
  const [notes, setNotes] = useState(interactions.filter(i => i.type === InteractionType.NOTE).map(i => i.summary).join('\n\n'));
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    const result = await summarizeNotes(notes);
    setSummary(result);
    setIsSummarizing(false);
  };

  const TabButton: React.FC<{tabId: 'policies'|'interactions'|'notes', label: string}> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-5 py-1.5 font-medium text-sm rounded-full ${activeTab === tabId ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8">
      <button onClick={onBack} className="text-primary-600 hover:underline mb-6">&larr; Back to List</button>
      
      <div className="bg-white p-8 rounded-lg border border-slate-200 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <img src={`https://i.pravatar.cc/150?u=${client.id}`} alt={`${client.firstName} ${client.lastName}`} className="w-20 h-20 rounded-full mr-6 mb-4 sm:mb-0" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">{client.firstName} {client.lastName}</h1>
            <p className="text-slate-600">{client.email} | {client.phone}</p>
            <p className="text-sm text-slate-500">{client.address}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-start sm:items-end space-y-2">
            {currentUser.role === UserRole.AGENT && client.status === ClientStatus.LEAD && (
                <button
                    onClick={() => onUpdateStatus(client.id, ClientStatus.ACTIVE)}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-emerald-600 transition-colors"
                >
                    Convert Lead to Client
                </button>
            )}
            {assignedAgent && (
                <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Assigned Agent</p>
                    <p className="font-semibold text-primary-600">{assignedAgent.name}</p>
                </div>
            )}
          </div>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Sensitive Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {/* Personal & Medical Details */}
              <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary-700">Personal & Medical</h3>
                  <DetailItem label="Date of Birth" value={client.dob} />
                  <DetailItem label="SSN" value={client.ssn} />
                  <DetailItem label="Height" value={client.height} />
                  <DetailItem label="Weight" value={client.weight ? `${client.weight} lbs` : null} />
                  <DetailItem label="Birth State" value={client.birthState} />
                  <DetailItem label="City" value={client.city} />
                  <DetailItem label="Current State" value={client.state} />
              </div>

              {/* Financial Details */}
              <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary-700">Financial Details</h3>
                  <DetailItem label="Bank Name" value={client.bankName} />
                  <DetailItem label="Account Type" value={client.accountType} />
                  <DetailItem label="Routing Number" value={client.routingNumber} />
                  <DetailItem label="Account Number" value={client.accountNumber} />
              </div>

              {/* Medication Details */}
              <div className="space-y-4 lg:col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold text-primary-700">Current Medications</h3>
                  {client.medications ? (
                      <p className="text-md text-slate-800 whitespace-pre-wrap bg-slate-50 p-3 rounded-md">{client.medications}</p>
                  ) : (
                      <p className="text-md text-slate-400 italic">Not Provided</p>
                  )}
              </div>
          </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
            <TabButton tabId="policies" label="Policies" />
            <TabButton tabId="interactions" label="Interactions" />
            <TabButton tabId="notes" label="Notes & AI Summary" />
        </div>
      </div>
      
      <div>
        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map(policy => <PolicyCard key={policy.id} policy={policy} onEdit={onOpenEditPolicyModal} onUpdatePolicy={onUpdatePolicy} />)}
            <button onClick={onOpenAddPolicyModal} className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 text-slate-500 hover:bg-slate-50 hover:border-primary-500 hover:text-primary-600 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
                <PlusIcon className="w-8 h-8 mb-2" />
                <span className="font-semibold">Add New Policy</span>
            </button>
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200">
             <h2 className="text-xl font-bold text-slate-700 mb-4">Interaction History</h2>
             <div className="relative border-l-2 border-slate-200 ml-3">
             {interactions.filter(i => i.type !== InteractionType.NOTE).map(interaction => (
                 <div key={interaction.id} className="mb-8 ml-8">
                    <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-xl">{getInteractionIcon(interaction.type)}</span>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-slate-800">{interaction.type}</p>
                            <time className="text-sm font-normal text-slate-500">{interaction.date}</time>
                        </div>
                        <p className="mt-2 text-slate-600">{interaction.summary}</p>
                    </div>
                </div>
             ))}
             </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-700 mb-4">Client Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={15}
                className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add notes about your client..."
              />
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-700">AI Summary</h2>
                 <button onClick={handleSummarize} disabled={isSummarizing || !notes} className="flex items-center bg-primary-600 text-white px-3 py-2 text-sm rounded-md shadow-sm hover:bg-primary-500 transition-colors disabled:bg-slate-400">
                    <AiSparklesIcon className="w-5 h-5 mr-2"/>
                    {isSummarizing ? 'Summarizing...' : 'Summarize Notes'}
                 </button>
              </div>
              <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-md h-[340px] overflow-y-auto">
                {isSummarizing && <p className="text-slate-500 animate-pulse">Generating summary...</p>}
                {summary ? <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} /> : !isSummarizing && <p className="text-slate-400">Click "Summarize Notes" to generate an AI summary of your notes.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;