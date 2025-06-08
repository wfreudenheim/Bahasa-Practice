import React, { ReactNode, useState } from 'react';
import { MobileMenu } from './MobileMenu';
import './Layout.css';

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  hideSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main, hideSidebar = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="layout">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        {sidebar}
      </MobileMenu>

      {/* Desktop Sidebar */}
      {!hideSidebar && (
        <aside className="layout-sidebar">
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main className={`layout-main ${hideSidebar ? 'full-width' : ''}`}>
        {main}
      </main>
    </div>
  );
}; 