/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_TIME, ADD_FRIEND, GO_BACK, GO_FORWARD } from "../actions/types";

/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const initState = {
  availableTimings: [],
  totalInputs: 0, //Start count from 0, as its used as array index
  currFocus: 0,
};

const addToTiming = (availableTimings, timeObject) => {
  var newAvailableTimings = availableTimings.slice(); // copy array
  newAvailableTimings.push(timeObject);
  return newAvailableTimings;
}

const decrementIfPossible = (currFocus) => {
  return currFocus <= 0 ? 0 : currFocus - 1;
}

const incrementIfPossible = (currFocus, limit) => {
  return currFocus >= limit ? limit : currFocus + 1;
}

export default function (state = initState, action) {
  switch (action.type) {
    case CHANGE_TIME:
      return Object.assign({}, state, {
        values: action.payload,
      });

    case ADD_FRIEND:
      return Object.assign({}, state, {
        availableTimings: addToTiming(state.availableTimings, action.payload),
        totalInputs: state.totalInputs + 1,
        currFocus: state.currFocus + 1
      });

    case GO_BACK:
      return Object.assign({}, state, {
        currFocus: decrementIfPossible(state.currFocus)
      });

    case GO_FORWARD:
      return Object.assign({}, state, {
        currFocus: incrementIfPossible(state.currFocus, state.totalInputs)
      });

    default:
      return state;
  }
}
