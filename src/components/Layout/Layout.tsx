import React, { ReactNode, useState, cloneElement } from 'react';
import { MobileMenu } from './MobileMenu';
import './Layout.css';

interface LayoutProps {
  sidebar: React.ReactElement<{ onClose?: () => void }>;
  main: ReactNode;
  hideSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main, hideSidebar = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Only show mobile menu button when sidebar should be visible
  const showMobileMenuButton = !hideSidebar;

  // Clone sidebar element with onClose prop
  const sidebarWithClose = cloneElement(sidebar, { 
    onClose: () => setIsMobileMenuOpen(false)
  });

  return (
    <div className="layout">
      {/* Mobile Menu Button - only show when sidebar is enabled */}
      {showMobileMenuButton && (
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Mobile Menu - only render when sidebar is enabled */}
      {showMobileMenuButton && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {sidebarWithClose}
        </MobileMenu>
      )}

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