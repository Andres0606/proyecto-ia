"use client";

import { useEffect } from "react";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  msg: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = {
    success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: '✅' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '❌' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a5f', icon: 'ℹ️' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' }
  }[type];

  return (
    <div 
      className="reveal reveal--visible" 
      style={{ 
        position: 'fixed', 
        top: '100px', 
        right: '40px', 
        zIndex: 10000, 
        background: config.bg, 
        border: `1px solid ${config.border}`, 
        color: config.text, 
        padding: '16px 24px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        minWidth: '320px',
        maxWidth: '450px',
        animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
      <span style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>{msg}</span>
      <button 
        onClick={onClose} 
        style={{ 
          marginLeft: 'auto', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          opacity: 0.5,
          fontSize: '1.2rem',
          color: 'inherit'
        }}
      >
        ×
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
