import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from '../config/navigationConfig';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();

  const isCurrentActive = (itemPath) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <nav className="smriti-bottom-nav-container" aria-label="Bottom Navigation">
      <div className="smriti-bottom-nav-inner">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isCurrentActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`smriti-nav-item ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="smriti-nav-icon">{item.icon}</span>
              <span className="smriti-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
