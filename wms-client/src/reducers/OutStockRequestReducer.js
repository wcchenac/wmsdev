import { GET_OutStockRequests } from "../actions/types";

const initialState = {
  outStockRequests: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_OutStockRequests:
      return {
        ...state,
        outStockRequests: action.payload
      };
    default:
      return state;
  }
}
