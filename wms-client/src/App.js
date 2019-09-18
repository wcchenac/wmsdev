import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AddClothInfo from "./components/BO/Cloth/InStock/AddClothInfo";
import { Provider } from "react-redux";
import store from "./store";
import ModifyBoard from "./components/BO/Cloth/ModifyStock/ModifyBoard";
import PreviewClothInfo from "./components/BO/Cloth/ModifyStock/PreviewClothInfo";
import TypeExchangeBoard from "./components/BO/Cloth/ModifyStock/TypeExchangeBoard";
import ReviseInStock from "./components/BO/Cloth/InStock/ReviseInStock";
import QueryBoard from "./components/BO/Cloth/QueryStock/QueryBoard";
import SameTypeModifyBoard from "./components/BO/Cloth/ModifyStock/SameTypeModifyBoard";
import BatchAddClothInfo from "./components/BO/Cloth/InStock/BatchAddClothInfo";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/cloth/1/1" component={AddClothInfo} />
          <Route exact path="/cloth/1/2" component={BatchAddClothInfo} />
          <Route exact path="/cloth/2" component={QueryBoard} />
          <Route exact path="/cloth/3" component={ModifyBoard} />
          <Route exact path="/cloth/3/:id" component={PreviewClothInfo} />
          <Route exact path="/cloth/3/1/:id" component={TypeExchangeBoard} />
          <Route exact path="/cloth/3/2/:id" component={SameTypeModifyBoard} />
          <Route exact path="/cloth/3/3/:id" />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
