import React, { useState, useCallback, useMemo, MouseEvent } from "react";
import NavbarContext, { type NavbarContextType } from "react-bootstrap/NavbarContext";
import { NavLink, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../actions/UserActions";
import HeaderStockFunctions from "./HeaderStockFunctions";
import HeaderUserFunctions from "./HeaderUserFunctions";
import { RootState, AppDispatch } from "../../types";

export type NavbarExpand = "sm" | "lg" | "xl";

// The width from which each role's menu fits on one line in the bar (Admin needs about 1021px,
// Operator 749px, Sales and Normal about 450px). Below it the toggler menu is used, so the links
// are not squeezed into one character per line. Storybook's navbar frame uses the same mapping.
export const EXPAND_BY_ROLE: Readonly<Record<string, NavbarExpand>> = {
  ROLE_Admin: "xl",
  ROLE_Operator: "lg",
};
const DEFAULT_EXPAND: NavbarExpand = "sm";

/** The navbar-expand-* breakpoint for a role; "sm" for anyone else (signed out, unknown role). */
export const navbarExpandFor = (authority: string | null | undefined): NavbarExpand =>
  (authority && EXPAND_BY_ROLE[authority]) || DEFAULT_EXPAND;

interface HeaderNavbarContextProps {
  expand: NavbarExpand;
  expanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

const noop = () => {};

/**
 * Tells the react-bootstrap dropdowns in the menu that they sit in a navbar: they then skip
 * Popper and leave layout to Bootstrap's navbar CSS (static in the collapsed toggler menu, so an
 * opened dropdown pushes the items below it down; absolute from the expand breakpoint up).
 */
export const HeaderNavbarContext: React.FC<HeaderNavbarContextProps> = ({
  expand,
  expanded = false,
  onToggle = noop,
  children,
}) => {
  // bsPrefix "navbar" is what react-bootstrap's Navbar provides; Nav builds its class from it.
  const value = useMemo<NavbarContextType>(
    () => ({ onToggle, expanded, expand, bsPrefix: "navbar" }),
    [onToggle, expanded, expand]
  );
  return <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>;
};

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate("/login");
  }, [dispatch, navigate]);

  // On a phone, close the opened menu once a page is picked (also the page already open).
  // Clicks on dropdown toggles (buttons) keep it open.
  const closeMenuOnLinkClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("a")) {
      setIsMobileMenuOpen(false);
    }
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prevState) => !prevState);
  }, []);

  const { validToken, user: userData } = user;
  // Handle both string and object formats for role
  // Backend JWT may return { authority: "ROLE_Admin" } or "ROLE_Admin"
  const role = userData.role;
  const authority: string | null = role
    ? typeof role === 'string'
      ? role
      : role.authority ?? null
    : null;
  const expand = navbarExpandFor(authority);

  const renderHeaderContent = (): React.ReactNode => {
    return (
      <div
        className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}
        id="mobile-nav"
        onClick={closeMenuOnLinkClick}
      >
        <HeaderStockFunctions
          isAuthencated={validToken}
          authority={authority ?? null}
        />
        <HeaderUserFunctions
          isAuthencated={validToken}
          fullName={userData.fullName}
          authority={authority}
          logout={handleLogout}
        />
      </div>
    );
  };

  const headerContent = renderHeaderContent();

  return (
    // sticky-top sits on the header: a sticky element only sticks inside its parent, and the
    // header (a child of the page-long div.App) is the nav's parent, exactly as tall as it.
    <header role="banner" className="sticky-top">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-100%',
          left: 'var(--spacing-4)',
          zIndex: 'var(--z-index-tooltip)',
          padding: 'var(--spacing-2) var(--spacing-4)',
          background: 'var(--color-primary)',
          color: 'var(--color-white)',
          borderRadius: 'var(--border-radius-base)',
          textDecoration: 'none',
          transition: 'var(--transition-fast)'
        }}
        onFocus={(e) => (e.target as HTMLAnchorElement).style.top = 'var(--spacing-4)'}
        onBlur={(e) => (e.target as HTMLAnchorElement).style.top = '-100%'}
      >
        跳至主要內容
      </a>

      <nav
        className={`navbar navbar-expand-${expand} navbar-dark bg-primary mb-4`}
        role="navigation"
        aria-label="主要導覽列"
        style={{
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-base)'
        }}
      >
        <div className="container">
          <NavLink
            className="navbar-brand"
            to="/"
            style={{
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: '0.5px'
            }}
          >
            庫存管理工具
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-controls="mobile-nav"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "關閉導覽選單" : "開啟導覽選單"}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <HeaderNavbarContext expand={expand} expanded={isMobileMenuOpen} onToggle={toggleMobileMenu}>
            {headerContent}
          </HeaderNavbarContext>
        </div>
      </nav>
    </header>
  );
};

export default Header;
