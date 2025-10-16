import React from 'react';
import { CrmLogoIcon, PhoneIcon } from './icons';

interface PublicHeaderProps {
  onNavigate: (view: string) => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ onNavigate }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button onClick={() => onNavigate('home')} aria-label="Go to homepage" title="New Holland Financial Group Homepage">
            <CrmLogoIcon className="w-48" variant="light" />
          </button>
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-700">
            <a href="#/home" onClick={() => onNavigate('home')} className="hover:text-primary-600 transition-colors">Home</a>
            <a href="#/services" onClick={() => onNavigate('services')} className="hover:text-primary-600 transition-colors">Services</a>
            <a href="#/about" onClick={() => onNavigate('about')} className="hover:text-primary-600 transition-colors">About Us</a>
            <a href="#/contact" onClick={() => onNavigate('contact')} className="hover:text-primary-600 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center space-x-4">
            <a href="#/contact" onClick={() => onNavigate('contact')} className="hidden sm:inline-block bg-primary-50 text-primary-600 font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-primary-100 transition-colors button-hover button-press">
              Get a Free Quote
            </a>
            <button onClick={() => onNavigate('dashboard')} className="bg-primary-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm shadow-md hover:bg-primary-700 transition-colors button-hover button-press">
              Agent Portal
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;