import { GET_ClothInfo } from "../actions/types";

const initialState = {
  clothInfos: [],
  clothInfo: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ClothInfo:
      return {
        ...state,
        clothInfo: action.payload
      };
    default:
      return state;
  }
}
