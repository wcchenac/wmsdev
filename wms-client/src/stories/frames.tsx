import React from "react";

export function AppNavbar({ children }: { children: React.ReactNode }) {
  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-primary">
      <span className="navbar-brand">庫存管理工具</span>
      {children}
    </nav>
  );
}

export function showStaticModal(Story: React.ComponentType) {
  return (
    <div className="show-static-modal">
      <style>{`
        .show-static-modal .modal.fade {
          display: block;
          opacity: 1;
          position: relative;
        }
        .show-static-modal .modal-dialog {
          margin: 1rem auto;
        }
      `}</style>
      <Story />
    </div>
  );
}
