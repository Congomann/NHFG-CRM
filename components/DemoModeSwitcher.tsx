import React from 'react';
import { UserRole } from '../types';
import { EyeIcon, UserCircleIcon, UsersIcon } from './icons';

interface DemoModeSwitcherProps {
  activeRole: UserRole;
  onSwitch: (role: UserRole | null) => void;
}

const DemoModeSwitcher: React.FC<DemoModeSwitcherProps> = ({ activeRole, onSwitch }) => {
  const Button: React.FC<{ role: UserRole, icon: React.ReactNode }> = ({ role, icon }) => (
    <button
      onClick={() => onSwitch(role === UserRole.ADMIN ? null : role)}
      className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
        activeRole === role
          ? 'bg-white text-primary-600 shadow-md'
          : 'text-white/70 hover:bg-white/20 hover:text-white'
      }`}
    >
      {icon}
      {role}
    </button>
  );

  return (
    <div className="sticky top-4 z-40 mx-auto max-w-max">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 flex items-center space-x-2 shadow-2xl border border-white/10">
            <div className="flex items-center text-white font-bold px-3">
                <EyeIcon className="w-5 h-5 mr-2 text-primary-400" />
                <span className="hidden sm:inline">Demo Portal View:</span>
            </div>
            <Button role={UserRole.ADMIN} icon={<UserCircleIcon className="w-5 h-5 mr-2" />} />
            <Button role={UserRole.SUB_ADMIN} icon={<UsersIcon className="w-5 h-5 mr-2" />} />
            <Button role={UserRole.AGENT} icon={<UsersIcon className="w-5 h-5 mr-2" />} />
        </div>
    </div>
  );
};

export default DemoModeSwitcher;