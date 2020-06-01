/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_TIME, ADD_FRIEND } from "../actions/types";

/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const initState = {
  availableTimings: [],

};

const addToTiming = (availableTimings, timeObject) => {
  var newAvailableTimings = availableTimings.slice(); // copy array
  newAvailableTimings.push(timeObject);
  return newAvailableTimings;
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
      });

    default:
      return state;
  }
}
