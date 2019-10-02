import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AddClothInfo from "./components/BO/Cloth/InStock/AddClothInfo";
import { Provider } from "react-redux";
import store from "./store";
import ModifyBoard from "./components/BO/Cloth/ModifyStock/ModifyBoard/ModifyBoard";
import TypeExchangeBoard from "./components/BO/Cloth/ModifyStock/TypeExchangeBoard/TypeExchangeBoard";
import ReviseInStock from "./components/BO/Cloth/InStock/ReviseInStock";
import QueryBoard from "./components/BO/Cloth/QueryStock/QueryBoard";
import SameTypeModifyBoard from "./components/BO/Cloth/ModifyStock/SameTypeModifyBoard/SameTypeModifyBoard";
import BatchAddClothInfo from "./components/BO/Cloth/InStock/BatchAddClothInfo/BatchAddClothInfo";
import ShrinkList from "./components/BO/Cloth/ModifyStock/ShrinkList/ShrinkList";
import OutStockRequestList from "./components/BO/Cloth/ModifyStock/OutStockList/OutStockRequestList";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/cloth/1/1" component={BatchAddClothInfo} />
          <Route exact path="/cloth/1/2" component={AddClothInfo} />
          {/** Path("/cloth/1/2") is for future function use */}
          <Route exact path="/cloth/2" component={QueryBoard} />
          <Route exact path="/cloth/3/1" /> {/** OutStockRequest */}
          <Route exact path="/cloth/3/2" component={OutStockRequestList} />
          <Route exact path="/cloth/4/1" component={ModifyBoard} />
          <Route exact path="/cloth/4/2" component={ShrinkList} />
          <Route exact path="/cloth/4/2/1/:id" component={TypeExchangeBoard} />
          <Route
            exact
            path="/cloth/4/2/2/:id"
            component={SameTypeModifyBoard}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
