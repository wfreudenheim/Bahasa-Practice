import React from 'react';
import './MobileMenu.css';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, children }) => {
  // Stop propagation to prevent double-closing
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      <div 
        className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} 
        onClick={handleOverlayClick}
      />
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="mobile-menu-content">
          {children}
        </div>
      </div>
    </>
  );
}; 