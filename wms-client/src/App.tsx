import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import NormalStockBoard from "./components/BO/Stock/InStock/NormalStockBoard";
import AssembleStockBoard from "./components/BO/Stock/InStock/AssembleStockBoard";
import CustomerReturnBoard from "./components/BO/Stock/InStock/CustomerReturnBoard";
import StoreReturnBoard from "./components/BO/Stock/InStock/StoreReturnBoard";
import ModifyBoard from "./components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard";
import ShrinkBoard from "./components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard";
import OutStockRequestList from "./components/BO/Stock/OutStockList/OutStockRequestList";
import QueryBoard from "./components/BO/Stock/QueryStock/QueryBoard";
import QueryBoard_Detail from "./components/BO/Stock/QueryStock/QueryBoard_Detail";
import QueryOutStockToStore from "./components/BO/Stock/QueryStock/QueryOutStockToStore";
import FileCenter from "./components/BO/File/FileCenter";
import StockHistoryBoard from "./components/BO/Stock/StockHistory/StockHistoryBoard";
import Login from "./components/BO/User/Login";
import AdminPlatform from "./components/BO/User/AdminPlatform/AdminPlatform";
import ProtectedRoute from "./components/Others/securities/ProtectedRoute";
import localStorageValidate from "./utilities/LocalStorageValidate";

function App() {
  localStorageValidate();

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <main id="main-content" role="main" aria-label="主要內容區域">
            <Routes>
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
                    <QueryBoard_Detail />
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
            </Routes>
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
