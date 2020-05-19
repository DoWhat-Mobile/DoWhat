/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_END_TIME, CHANGE_START_TIME } from "../actions/types";

/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const initState = {
    start_Y_Coord: 148, // Coordinates used to ensure start draggable component doesnt exceed the end
    end_Y_Coord: 680,
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
                time_interval: (action.payload - state.initial_time) <= 0 ? 0 : (action.payload - state.initial_time),
                end_Y_Coord: action.end_Y_Coord
            });
        case CHANGE_START_TIME:
            return Object.assign({}, state, {
                initial_time: action.payload,
                end_time: state.end_time,
                time_interval: (state.end_time - action.payload) <= 0 ? 0 : (state.end_time - action.payload),
                start_Y_Coord: action.start_Y_Coord
            })
        default:
            return state;
    }
}

