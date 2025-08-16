import React from 'react';
import './GhostLoader.css';

function GhostLoader() {
  return (
    <div className="ghost-loader-container">
      <div className="ghost-loader">
        <div className="ghost-loader-header">
          <div className="ghost-loader-avatar"></div>
          <div className="ghost-loader-lines">
            <div className="ghost-loader-line"></div>
            <div className="ghost-loader-line"></div>
          </div>
        </div>
        <div className="ghost-loader-content">
          <div className="ghost-loader-line"></div>
          <div className="ghost-loader-line"></div>
          <div className="ghost-loader-line"></div>
          <div className="ghost-loader-line"></div>
        </div>
      </div>
    </div>
  );
}

export default GhostLoader;