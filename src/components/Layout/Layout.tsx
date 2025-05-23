import React, { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main }) => {
  return (
    <div className="layout">
      <aside className="layout-sidebar">
        {sidebar}
      </aside>
      <main className="layout-main">
        {main}
      </main>
    </div>
  );
}; 