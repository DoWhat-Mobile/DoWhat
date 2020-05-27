import { combineReducers } from "redux";
import auth from "./auth_reducer";
import timeline from "./timeline_reducer";
import genre from "./genre_reducer";

export default combineReducers({
  auth,
  timeline,
  genre,
});
