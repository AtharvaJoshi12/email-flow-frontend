// components/NodeModal.jsx
import React from 'react';

const NodeModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const options = [
    { label: '📧 Cold Email', type: 'coldEmail' },
    { label: '⏳ Wait/Delay', type: 'waitDelay' },
    { label: '📍 Lead Source', type: 'leadSource' }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 10, minWidth: 300 }}>
        <h3>Select Node Type</h3>
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            style={{
              margin: '5px 0',
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: 5,
              cursor: 'pointer',
              background: '#f3f3f3'
            }}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={onClose}
          style={{
            marginTop: 10, width: '100%',
            background: '#ff4d4d', color: '#fff', padding: 8, borderRadius: 5
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NodeModal;
