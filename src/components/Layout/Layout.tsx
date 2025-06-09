import React, { ReactNode, useState, useCallback, cloneElement, memo } from 'react';
import { MobileMenu } from './MobileMenu';
import './Layout.css';

interface LayoutProps {
  sidebar: React.ReactElement<{ onClose?: () => void }>;
  main: ReactNode;
  hideSidebar?: boolean;
}

export const Layout = memo(({ sidebar, main, hideSidebar = false }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Only show mobile menu button when sidebar should be visible
  const showMobileMenuButton = !hideSidebar;

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Clone sidebar element with onClose prop
  const sidebarWithClose = React.useMemo(() => 
    cloneElement(sidebar, { onClose: handleMobileMenuClose }),
    [sidebar, handleMobileMenuClose]
  );

  return (
    <div className="layout">
      {/* Mobile Menu Button - only show when sidebar is enabled */}
      {showMobileMenuButton && (
        <button 
          className="mobile-menu-button"
          onClick={handleMobileMenuToggle}
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
          onClose={handleMobileMenuClose}
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
}); 