import { FINALIZE_GENRE } from "../actions/types";


export default function (state = [], action) {
  switch (action.type) {
    case FINALIZE_GENRE:
      return { genres: action.payload };

    default:
      return state;
  }
}
