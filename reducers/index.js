import { combineReducers } from "redux";
import auth from "./auth_reducer";
import timeline from './timeline_reducer'
import google_calendar_input from './google_calendar_input_reducer';

export default combineReducers({
  auth, timeline, google_calendar_input,
});
