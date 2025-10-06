import React, { useState } from 'react';
import { User, UserRole, Agent } from '../types';
import { EyeIcon, UserCircleIcon, UsersIcon, ChevronDownIcon } from './icons';

interface DemoModeSwitcherProps {
  adminUser: User;
  subAdminUser?: User;
  agents: Agent[];
  impersonatedUserId: number | null;
  onSwitchUser: (userId: number | null) => void;
}

const DemoModeSwitcher: React.FC<DemoModeSwitcherProps> = ({ adminUser, subAdminUser, agents, impersonatedUserId, onSwitchUser }) => {
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  const isActive = (userId: number | null) => {
    return impersonatedUserId === userId;
  };

  return (
    <div className="sticky top-4 z-40 mx-auto max-w-max">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 flex items-center space-x-2 shadow-2xl border border-white/10">
            <div className="flex items-center text-white font-bold px-3">
                <EyeIcon className="w-5 h-5 mr-2 text-primary-400" />
                <span className="hidden sm:inline">Demo Portal View:</span>
            </div>
            
            <button
              onClick={() => onSwitchUser(null)}
              className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                isActive(null)
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <UserCircleIcon className="w-5 h-5 mr-2" />
              {adminUser.role}
            </button>
            
            {subAdminUser && (
              <button
                onClick={() => onSwitchUser(subAdminUser.id)}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                  isActive(subAdminUser.id)
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                {subAdminUser.role}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setIsAgentDropdownOpen(prev => !prev)}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                  agents.some(a => a.id === impersonatedUserId)
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                Agents
                <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAgentDropdownOpen && (
                <div 
                  className="absolute top-full mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 py-1"
                  onMouseLeave={() => setIsAgentDropdownOpen(false)}
                >
                  {agents.map(agent => (
                    <a
                      key={agent.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onSwitchUser(agent.id);
                        setIsAgentDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {agent.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
        </div>
    </div>
  );
};

export default DemoModeSwitcher;
