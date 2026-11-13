import React from "react";

export function AppNavbar({ children }: { children: React.ReactNode }) {
  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-primary">
      <span className="navbar-brand">庫存管理工具</span>
      {children}
    </nav>
  );
}
