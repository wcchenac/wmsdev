import React from "react";
import type { Preview } from "@storybook/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const theme = createTheme();

interface RouterParameters {
  initialEntries?: string[];
}

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const router = context.parameters.router as RouterParameters | undefined;
      const initialEntries = router?.initialEntries ?? ["/"];

      return (
        <ThemeProvider theme={theme}>
          <MemoryRouter key={context.id} initialEntries={initialEntries}>
            <Story />
          </MemoryRouter>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
