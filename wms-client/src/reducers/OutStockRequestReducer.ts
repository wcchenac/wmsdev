import {
  GET_OutStockRequests,
  OutStockRequestState,
  Action
} from "../types";

const initialState: OutStockRequestState = {
  outStockRequests: {}
};

interface OutStockRequestsPayload {
  queryResult?: Record<string, unknown>;
  userList?: string[];
}

type OutStockRequestAction = Action<OutStockRequestsPayload>;

export default function OutStockRequestReducer(
  state: OutStockRequestState = initialState,
  action: OutStockRequestAction
): OutStockRequestState {
  switch (action.type) {
    case GET_OutStockRequests:
      return {
        ...state,
        outStockRequests: action.payload ?? {}
      };
    default:
      return state;
  }
}
