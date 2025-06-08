import React, { ReactNode, useState, cloneElement, isValidElement } from 'react';
import { MobileMenu } from './MobileMenu';
import { VocabularySidebar } from '../VocabularySidebar/VocabularySidebar';
import './Layout.css';

interface LayoutProps {
  sidebar: React.ReactElement<{ onClose?: () => void }>;
  main: ReactNode;
  hideSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main, hideSidebar = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Clone sidebar element with onClose prop
  const sidebarWithClose = cloneElement(sidebar, { 
    onClose: () => setIsMobileMenuOpen(false)
  });

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
        {sidebarWithClose}
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