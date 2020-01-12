import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import BatchAddStockInfo from "./components/BO/Stock/InStock/BatchAddStockInfo/BatchAddStockInfo";
import AssembleStockBoard from "./components/BO/Stock/InStock/AddAssembleStockInfo/AssembleStockBoard";
import ModifyBoard from "./components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard";
import ShrinkBoard from "./components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard";
import OutStockRequestList from "./components/BO/Stock/OutStockList/OutStockRequestList";
import QueryBoard from "./components/BO/Stock/QueryStock/QueryBoard";
import FileCenter from "./components/BO/File/FileCenter";
import StockHistoryBoard from "./components/BO/Stock/StockHistory/StockHistoryBoard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/stock/1/1" component={BatchAddStockInfo} />
          <Route exact path="/stock/1/2" component={AssembleStockBoard} />
          <Route exact path="/stock/2" component={QueryBoard} />
          <Route exact path="/stock/3/1" component={ModifyBoard} />
          <Route exact path="/stock/3/2" component={ShrinkBoard} />
          <Route exact path="/stock/4" component={OutStockRequestList} />
          <Route exact path="/stock/5" component={StockHistoryBoard} />
          <Route exact path="/files" component={FileCenter} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
