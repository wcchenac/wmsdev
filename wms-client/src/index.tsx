import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import localStorageValidate from "./utilities/LocalStorageValidate";

// Check the stored token once, before the first render: a page opened directly then finds the
// user already signed in (ProtectedRoute reads the store during that render).
localStorageValidate();

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
