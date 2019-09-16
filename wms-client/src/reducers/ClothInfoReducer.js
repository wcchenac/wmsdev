import { GET_ClothInfo, GET_ClothInfoes, SHIP_Cloth } from "../actions/types";

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
    case SHIP_Cloth:
      return {
        ...state,
        clothInfoes: state.clothInfoes.filter(
          clothInfo => clothInfo.clothIdentifier.id !== action.payload
        )
      };
    default:
      return state;
  }
}
