import React from 'react';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, children }) => {
  return (
    <>
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="mobile-menu-content">
          {children}
        </div>
      </div>
    </>
  );
}; 