// Alias React's own act so testing-library/no-unnecessary-act does not mistake
// these createRoot calls for Testing Library utilities.
import React, { act as reactAct } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  reactAct(() => {
    root.render(<App />);
  });
  reactAct(() => {
    root.unmount();
  });
});
