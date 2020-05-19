/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_END_TIME, CHANGE_START_TIME } from "../actions/types";

/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const initState = {
    initial_time: 8,
    end_time: 24,
    time_interval: 24 - 8
}

export default function (state = initState, action) {
    switch (action.type) {
        case CHANGE_END_TIME:
            return Object.assign({}, state, {
                initial_time: state.initial_time,
                end_time: action.payload,
                time_interval: action.payload - state.initial_time
            });
        case CHANGE_START_TIME:
            return Object.assign({}, state, {
                initial_time: action.payload,
                end_time: state.end_time,
                time_interval: state.end_time - action.payload
            });
        default:
            return state;
    }
}

