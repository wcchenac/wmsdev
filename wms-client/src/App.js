import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AddClothInfo from "./components/BO/Cloth/AddClothInfo";
import { Provider } from "react-redux";
import store from "./store";
import QueryBoard from "./components/BO/Cloth/QueryBoard";
import PreviewClothInfo from "./components/BO/Cloth/PreviewClothInfo";
import TypeExchangeBoard from "./components/BO/Cloth/TypeExchangeBoard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/cloth/1" component={AddClothInfo} />
          <Route exact path="/cloth/2" component={QueryBoard} />
          <Route exact path="/cloth/2/:id" component={PreviewClothInfo} />
          <Route exact path="/cloth/3/:id" component={TypeExchangeBoard} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
