import React, { useState, useCallback, MouseEvent, ReactNode } from "react";
import UserRegister from "./UserRegister";
import UserManagement from "./UserManagement/UserManagement";
import InStockByImportFile from "./InStockByImportFile";
import ScheduleMission from "./ScheduleMission";
import ShrinkRollback from "./ShrinkRollback/ShrinkRollback";
import StockCategory from "./StockCategory";
import InStockRollback from "./InStockRollback/InStockRollback";
import SetWarehouse from "./SetWarehouse";

type FunctionSelection =
  | ""
  | "userRegister"
  | "userManagement"
  | "importFile"
  | "scheduleMission"
  | "inStockRollback"
  | "shrinkRollback"
  | "stockCategory"
  | "settingWH";

const AdminPlatform: React.FC = () => {
  const [functionSelection, setFunctionSelection] = useState<FunctionSelection>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const buttonClick = useCallback((e: MouseEvent<HTMLButtonElement>): void => {
    setFunctionSelection(e.currentTarget.name as FunctionSelection);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const renderSubFunction = (): ReactNode => {
    switch (functionSelection) {
      case "userRegister":
        return <UserRegister />;
      case "userManagement":
        return <UserManagement />;
      case "importFile":
        return <InStockByImportFile />;
      case "scheduleMission":
        return <ScheduleMission />;
      case "inStockRollback":
        return <InStockRollback />;
      case "shrinkRollback":
        return <ShrinkRollback />;
      case "stockCategory":
        return <StockCategory />;
      case "settingWH":
        return <SetWarehouse />;
      default:
        return null;
    }
  };

  const menuItems = [
    { name: 'userRegister', icon: 'fa-user-plus', label: '新增使用者', disabled: false },
    { name: 'userManagement', icon: 'fa-users', label: '使用者管理', disabled: false },
    { name: 'importFile', icon: 'fa-upload', label: '批量入庫', disabled: false },
    { name: 'inStockRollback', icon: 'fa-undo', label: '入庫回朔', disabled: false },
    { name: 'shrinkRollback', icon: 'fa-history', label: '減肥回朔', disabled: false },
    { name: 'stockCategory', icon: 'fa-tags', label: '庫存類別', disabled: false },
    { name: 'settingWH', icon: 'fa-building', label: '設定倉別', disabled: true },
    { name: 'scheduleMission', icon: 'fa-calendar', label: '任務排程', disabled: false },
  ];

  return (
    <div className="admin-platform">
      <div className="container-fluid">
        {/* Mobile Menu Toggle Button */}
        <div
          className="d-md-none"
          style={{
            marginBottom: 'var(--spacing-3)',
          }}
        >
          <button
            type="button"
            className="btn btn-outline-primary w-100"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-2)',
              padding: 'var(--spacing-3)',
            }}
          >
            <i className={`fa ${sidebarOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true" />
            <span>{sidebarOpen ? '關閉選單' : '開啟管理選單'}</span>
            {functionSelection && (
              <span
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  marginLeft: 'var(--spacing-2)',
                }}
              >
                {menuItems.find(item => item.name === functionSelection)?.label}
              </span>
            )}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--spacing-4)',
            minHeight: '80vh',
          }}
        >
          {/* Sidebar - Collapsible on mobile */}
          <div
            id="admin-sidebar"
            className={sidebarOpen ? 'd-block' : 'd-none d-md-block'}
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              padding: 'var(--spacing-4)',
              width: '100%',
              maxWidth: '280px',
              flexShrink: 0,
              position: sidebarOpen ? 'absolute' : 'relative',
              zIndex: sidebarOpen ? 1000 : 'auto',
              top: sidebarOpen ? 'auto' : undefined,
              left: sidebarOpen ? 'var(--spacing-3)' : undefined,
              right: sidebarOpen ? 'var(--spacing-3)' : undefined,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-4)',
                paddingBottom: 'var(--spacing-3)',
                borderBottom: '2px solid var(--color-primary-light)',
              }}
            >
              <i
                className="fa fa-cogs"
                style={{
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-primary)',
                }}
                aria-hidden="true"
              />
              <h5
                style={{
                  margin: 0,
                  color: 'var(--color-gray-800)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                管理功能
              </h5>
            </div>
            <nav aria-label="管理功能選單">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  className={`btn w-100 text-start justify-content-start mb-2 ${
                    functionSelection === item.name ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  name={item.name as FunctionSelection}
                  onClick={buttonClick}
                  disabled={item.disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    borderRadius: 'var(--border-radius-md)',
                    transition: 'var(--transition-fast)',
                    fontWeight: functionSelection === item.name ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                  }}
                >
                  <i className={`fa ${item.icon}`} aria-hidden="true" style={{ width: '20px' }} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="d-md-none"
              onClick={toggleSidebar}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              }}
              aria-hidden="true"
            />
          )}

          {/* Main Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                minHeight: '80vh',
                padding: 'var(--spacing-4)',
              }}
            >
              {functionSelection ? (
                renderSubFunction()
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                    color: 'var(--color-gray-400)',
                    padding: 'var(--spacing-4)',
                    textAlign: 'center',
                  }}
                >
                  <i
                    className="fa fa-hand-pointer-o fa-4x mb-4 d-none d-md-block"
                    aria-hidden="true"
                    style={{ opacity: 0.5 }}
                  />
                  <i
                    className="fa fa-arrow-up fa-3x mb-3 d-md-none"
                    aria-hidden="true"
                    style={{ opacity: 0.5 }}
                  />
                  <h5 style={{ color: 'var(--color-gray-500)', fontWeight: 'var(--font-weight-medium)' }}>
                    <span className="d-none d-md-inline">請從左側選單選擇功能</span>
                    <span className="d-md-none">請點擊上方選單選擇功能</span>
                  </h5>
                  <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                    選擇一個管理功能開始操作
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlatform;
