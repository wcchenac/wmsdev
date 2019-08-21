import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AddClothInfo from "./components/BO/Cloth/AddClothInfo";
import { Provider } from "react-redux";
import store from "./store";
import QueryBoard from "./components/BO/Cloth/QueryBoard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/cloth/instock" component={AddClothInfo} />
          <Route exact path="/cloth/query" component={QueryBoard} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
