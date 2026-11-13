import React, { useState, useCallback } from "react";
import { NavLink } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../actions/UserActions";
import HeaderStockFunctions from "./HeaderStockFunctions";
import HeaderUserFunctions from "./HeaderUserFunctions";
import { RootState, AppDispatch } from "../../types";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    window.location.href = "/";
  }, [dispatch]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prevState) => !prevState);
  }, []);

  const renderHeaderContent = (): React.ReactNode => {
    const { validToken, user: userData } = user;
    // Handle both string and object formats for role
    // Backend JWT may return { authority: "ROLE_Admin" } or "ROLE_Admin"
    const role = userData.role;
    const authority: string | null = role
      ? typeof role === 'string'
        ? role
        : role.authority ?? null
      : null;

    return (
      <div
        className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}
        id="mobile-nav"
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
    <header role="banner">
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
        className="navbar sticky-top navbar-expand-sm navbar-dark bg-primary mb-4"
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
          {headerContent}
        </div>
      </nav>
    </header>
  );
};

export default Header;
