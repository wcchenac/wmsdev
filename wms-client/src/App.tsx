import React, { Suspense, lazy } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ToastContainer } from "react-toastify";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Provider } from "react-redux";
import store from "./store";
import ProtectedRoute from "./components/Others/securities/ProtectedRoute";
import HomeRedirect from "./components/Others/securities/HomeRedirect";
import { Spinner } from "./components/Others/Spinner";

const NormalStockBoard = lazy(() => import("./components/BO/Stock/InStock/NormalStockBoard"));
const AssembleStockBoard = lazy(() => import("./components/BO/Stock/InStock/AssembleStockBoard"));
const CustomerReturnBoard = lazy(() => import("./components/BO/Stock/InStock/CustomerReturnBoard"));
const StoreReturnBoard = lazy(() => import("./components/BO/Stock/InStock/StoreReturnBoard"));
const ModifyBoard = lazy(() => import("./components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard"));
const ShrinkBoard = lazy(() => import("./components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard"));
const OutStockRequestList = lazy(() => import("./components/BO/Stock/OutStockList/OutStockRequestList"));
const QueryBoard = lazy(() => import("./components/BO/Stock/QueryStock/QueryBoard"));
const QueryBoardDetail = lazy(() => import("./components/BO/Stock/QueryStock/QueryBoard_Detail"));
const QueryOutStockToStore = lazy(() => import("./components/BO/Stock/QueryStock/QueryOutStockToStore"));
const FileCenter = lazy(() => import("./components/BO/File/FileCenter"));
const StockHistoryBoard = lazy(() => import("./components/BO/Stock/StockHistory/StockHistoryBoard"));
const Login = lazy(() => import("./components/BO/User/Login"));
const AdminPlatform = lazy(() => import("./components/BO/User/AdminPlatform/AdminPlatform"));

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <main id="main-content" role="main" aria-label="主要內容區域">
            <Suspense fallback={<div className="py-5"><Spinner size="medium" message="載入頁面中..." /></div>}>
              <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/stock/1/1"
                element={
                  <ProtectedRoute level="M1">
                    <NormalStockBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/1/2"
                element={
                  <ProtectedRoute level="M1">
                    <AssembleStockBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/1/3"
                element={
                  <ProtectedRoute level="M1">
                    <CustomerReturnBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/1/4"
                element={
                  <ProtectedRoute level="M1">
                    <StoreReturnBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/2/1"
                element={
                  <ProtectedRoute level="L1">
                    <QueryBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/2/2"
                element={
                  <ProtectedRoute level="L2">
                    <QueryBoardDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/2/3"
                element={
                  <ProtectedRoute level="L3">
                    <QueryOutStockToStore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/3/1"
                element={
                  <ProtectedRoute level="M1">
                    <ModifyBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/3/2"
                element={
                  <ProtectedRoute level="M1">
                    <ShrinkBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/4"
                element={
                  <ProtectedRoute level="M1">
                    <OutStockRequestList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/5"
                element={
                  <ProtectedRoute level="M2">
                    <StockHistoryBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute level="H">
                    <FileCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute level="H">
                    <AdminPlatform />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={5}
            aria-label="通知訊息"
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
