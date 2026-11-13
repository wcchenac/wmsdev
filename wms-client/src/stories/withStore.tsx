import React from "react";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import { thunk } from "redux-thunk";
import type { Decorator } from "@storybook/react-vite";
import rootReducer from "../reducers";

export interface SessionArgs {
  validToken?: boolean;
  authority?: string;
  fullName?: string;
}

export function createStoryStore(session: SessionArgs = {}) {
  const validToken = Boolean(session.validToken);

  return createStore(
    rootReducer,
    {
      user: {
        validToken,
        users: [],
        user: validToken
          ? {
              fullName: session.fullName ?? "王小明",
              role: { authority: session.authority ?? "" },
            }
          : {},
      },
    },
    applyMiddleware(thunk)
  );
}

export const withStore: Decorator = (Story, context) => {
  const args = context.args as SessionArgs;
  const store = createStoryStore({
    validToken: args.validToken,
    authority: args.authority,
    fullName: args.fullName,
  });

  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};
