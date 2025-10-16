import React, { useState, useMemo } from 'react';
import { Client, ClientStatus, Agent } from '../types';
import { PlusIcon, CloseIcon, SearchIcon } from './icons';

interface ClientListProps {
  title: string;
  clients: Client[];
  onSelectClient: (id: number) => void;
  onAddClient: () => void;
  agentFilter?: Agent | null;
  onClearFilter?: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ title, clients, onSelectClient, onAddClient, agentFilter, onClearFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const fullName = `${client.firstName} ${client.lastName}`;
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE: return 'bg-emerald-100 text-emerald-800';
      case ClientStatus.LEAD: return 'bg-amber-100 text-amber-800';
      case ClientStatus.INACTIVE: return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">{title}</h1>
        <button onClick={onAddClient} className="flex items-center bg-primary-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 button-press">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Client
        </button>
      </div>
      
      {agentFilter && onClearFilter && (
        <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-2 rounded-lg mb-6 flex justify-between items-center">
            <span>Viewing clients for <strong>{agentFilter.name}</strong>.</span>
            <button onClick={onClearFilter} className="flex items-center font-semibold hover:underline">
                <CloseIcon className="w-4 h-4 mr-1" />
                Clear Filter
            </button>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Clear search"
                title="Clear search"
                >
                <CloseIcon className="h-4 w-4" />
                </button>
            </div>
            )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
          className="px-4 py-2 border border-slate-300 rounded-md bg-white w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredClients.map((client) => (
              <tr key={client.id} onClick={() => onSelectClient(client.id)} className="hover:bg-slate-50 cursor-pointer row-enter">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{client.firstName} {client.lastName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{client.email}</div>
                  <div className="text-sm text-slate-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;