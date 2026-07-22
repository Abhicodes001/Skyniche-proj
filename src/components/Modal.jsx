import React from "react";
import "../styles/Dashboard.css";

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, type = "info", onClose }) {
  if (!message) return null;

  return (
    <div className={`toast-banner toast-${type}`}>
      <span className="toast-icon">
        {type === "success" && "✅"}
        {type === "error" && "⚠️"}
        {type === "info" && "ℹ️"}
      </span>
      <span className="toast-text">{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}
