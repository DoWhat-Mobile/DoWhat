import { combineReducers } from "redux";
import auth from "./auth_reducer";
import timeline from './timeline_reducer'
import google_auth from './google_auth_reducer';

export default combineReducers({
  auth, timeline, google_auth,
});
