import React from 'react';
import { CrmLogoIcon, LinkedInIcon, FacebookIcon, InstagramIcon, TwitterIcon } from './icons';

interface PublicFooterProps {
  onNavigate: (view: string) => void;
}

const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <CrmLogoIcon variant="dark" className="w-48" />
            <p className="text-slate-400 text-sm">
              Providing tailored insurance solutions that secure financial peace of mind for individuals, families, and businesses.
            </p>
            <div className="flex space-x-4 text-slate-400">
                <a href="#" className="hover:text-white"><LinkedInIcon className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white"><FacebookIcon className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white"><InstagramIcon className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white"><TwitterIcon className="w-5 h-5" /></a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:col-span-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Navigation</h3>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><a href="#/home" onClick={() => onNavigate('home')} className="hover:text-white">Home</a></li>
                <li><a href="#/services" onClick={() => onNavigate('services')} className="hover:text-white">Services</a></li>
                <li><a href="#/about" onClick={() => onNavigate('about')} className="hover:text-white">About Us</a></li>
                <li><a href="#/contact" onClick={() => onNavigate('contact')} className="hover:text-white">Contact</a></li>
                 <li><a href="#/dashboard" onClick={() => onNavigate('dashboard')} className="hover:text-white">Agent Portal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Services</h3>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><a href="#/services" className="hover:text-white">Life Insurance</a></li>
                <li><a href="#/services" className="hover:text-white">Health Insurance</a></li>
                <li><a href="#/services" className="hover:text-white">Property & Auto</a></li>
                <li><a href="#/services" className="hover:text-white">Group Benefits</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Contact Us</h3>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><a href="mailto:Info@newhollandfinancial.com">Info@newhollandfinancial.com</a></li>
                <li><a href="tel:717-847-9638">(717) 847-9638</a></li>
                <li>Des Moines, IA</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} New Holland Financial Group | www.newhollandfinancial.com</p>
          <p className="mt-2 text-xs">This website is for informational purposes only and does not constitute a complete description of our investment services or performance. This website is in no way a solicitation or offer to sell securities or investment advisory services except, where applicable, in states where we are registered or where an exemption or exclusion from such registration exists.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;