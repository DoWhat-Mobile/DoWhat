import { combineReducers } from "redux";
import timeline from './timeline_reducer'
import genre from "./genre_reducer";
import date_select from './date_select_reducer';

export default combineReducers({
  timeline, genre, date_select,
});
