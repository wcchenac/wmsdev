import React from "react";
import { HeaderNavbarContext, navbarExpandFor } from "../components/Layout/Header";

/**
 * The app navbar around a Layout story: the same per-role navbar-expand-* breakpoint and
 * NavbarContext as Header, so menus collapse and dropdowns lay out as they do in the app.
 */
export function AppNavbar({ authority, children }: { authority?: string | null; children: React.ReactNode }) {
  const expand = navbarExpandFor(authority);
  return (
    <nav className={`navbar navbar-expand-${expand} navbar-dark bg-primary`}>
      <span className="navbar-brand">庫存管理工具</span>
      <HeaderNavbarContext expand={expand}>{children}</HeaderNavbarContext>
    </nav>
  );
}
