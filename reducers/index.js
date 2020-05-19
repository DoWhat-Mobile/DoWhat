import { combineReducers } from "redux";
import auth from "./auth_reducer";
import timeline from './timeline_reducer'

export default combineReducers({
  auth, timeline
});
