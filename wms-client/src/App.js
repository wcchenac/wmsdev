import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Layout/Header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import AddClothInfo from "./components/BO/Cloth/AddClothInfo";
import { Provider } from "react-redux";
import store from "./store";
import QueryModifyBoard from "./components/BO/Cloth/QueryModifyBoard";
import PreviewClothInfo from "./components/BO/Cloth/PreviewClothInfo";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Route exact path="/cloth/1" component={AddClothInfo} />
          <Route exact path="/cloth/2" component={QueryModifyBoard} />
          <Route exact path="/cloth/2/:id" component={PreviewClothInfo} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
