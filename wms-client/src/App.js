import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import BatchAddClothInfo from "./components/BO/Cloth/InStock/BatchAddClothInfo/BatchAddClothInfo";
import QueryBoard from "./components/BO/Cloth/QueryStock/QueryBoard";
import ModifyBoard from "./components/BO/Cloth/ModifyStock/ModifyBoard/ModifyBoard";
import ShrinkBoard from "./components/BO/Cloth/ModifyStock/ShrinkBoard/ShrinkBoard";
import OutStockRequestList from "./components/BO/Cloth/ModifyStock/OutStockList/OutStockRequestList";
import AssembleClothBoard from "./components/BO/Cloth/InStock/AddAssembleClothInfo/AssembleClothBoard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/cloth/1/1" component={BatchAddClothInfo} />
          <Route exact path="/cloth/1/2" component={AssembleClothBoard} />
          <Route exact path="/cloth/2" component={QueryBoard} />
          <Route exact path="/cloth/3/1" component={ModifyBoard} />
          <Route exact path="/cloth/3/2" component={ShrinkBoard} />
          <Route exact path="/cloth/3/3" component={OutStockRequestList} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
