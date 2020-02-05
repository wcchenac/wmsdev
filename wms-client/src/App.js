import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import NormalStockBoard from "./components/BO/Stock/InStock/NormalStockBoard";
import AssembleStockBoard from "./components/BO/Stock/InStock/AssembleStockInfo/AssembleStockBoard";
import CustomerReturnBoard from "./components/BO/Stock/InStock/CustomerReturnBoard";
import StoreReturnBoard from "./components/BO/Stock/InStock/StoreReturnBoard";
import ModifyBoard from "./components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard";
import ShrinkBoard from "./components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard";
import OutStockRequestList from "./components/BO/Stock/OutStockList/OutStockRequestList";
import QueryBoard from "./components/BO/Stock/QueryStock/QueryBoard";
import QueryBoardForSales from "./components/BO/Stock/QueryStock/QueryBoardForSales";
import FileCenter from "./components/BO/File/FileCenter";
import StockHistoryBoard from "./components/BO/Stock/StockHistory/StockHistoryBoard";
import Login from "./components/BO/User/Login";
import AdminPlatform from "./components/BO/User/AdminPlatform/AdminPlatform";
import SecuredRouteLvH from "./components/Others/securities/SecuredRouteLvH";
import SecuredRouteLvM from "./components/Others/securities/SecuredRouteLvM";
import SecuredRouteLvL1 from "./components/Others/securities/SecuredRouteLvL1";
import SecuredRouteLvL2 from "./components/Others/securities/SecuredRouteLvL2";
import localStorageValidate from "./utilities/LocalStorageValidate";

function App() {
  localStorageValidate();

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Switch>
            <Route exact path="/login" component={Login} />
            <SecuredRouteLvM
              exact
              path="/stock/1/1"
              component={NormalStockBoard}
            />
            <SecuredRouteLvM
              exact
              path="/stock/1/2"
              component={AssembleStockBoard}
            />
            <SecuredRouteLvM
              exact
              path="/stock/1/3"
              component={CustomerReturnBoard}
            />
            <SecuredRouteLvM
              exact
              path="/stock/1/4"
              component={StoreReturnBoard}
            />
            <SecuredRouteLvL1 exact path="/stock/2/1" component={QueryBoard} />
            <SecuredRouteLvL2
              exact
              path="/stock/2/2"
              component={QueryBoardForSales}
            />
            <SecuredRouteLvM exact path="/stock/3/1" component={ModifyBoard} />
            <SecuredRouteLvM exact path="/stock/3/2" component={ShrinkBoard} />
            <SecuredRouteLvM
              exact
              path="/stock/4"
              component={OutStockRequestList}
            />
            <SecuredRouteLvM
              exact
              path="/stock/5"
              component={StockHistoryBoard}
            />
            <SecuredRouteLvM exact path="/files" component={FileCenter} />
            <SecuredRouteLvH exact path="/admin" component={AdminPlatform} />
          </Switch>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
