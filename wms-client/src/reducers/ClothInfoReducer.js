import { GET_ClothInfo, GET_ClothInfoes } from "../actions/types";

const initialState = {
  clothInfoes: [],
  clothInfo: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ClothInfo:
      return {
        ...state,
        clothInfo: action.payload
      };
    case GET_ClothInfoes:
      return {
        ...state,
        clothInfoes: action.payload
      };
    default:
      return state;
  }
}
