import React, { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  hideSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main, hideSidebar = false }) => {
  return (
    <div className="layout">
      {!hideSidebar && (
        <aside className="layout-sidebar">
          {sidebar}
        </aside>
      )}
      <main className={`layout-main ${hideSidebar ? 'full-width' : ''}`}>
        {main}
      </main>
    </div>
  );
}; 