import { combineReducers } from "redux";
import timeline from './timeline_reducer'
import genre from "./genre_reducer";
import date_select from './date_select_reducer';
import add_events from './auth_screen_reducer';

export default combineReducers({
  timeline, genre, date_select, add_events
});