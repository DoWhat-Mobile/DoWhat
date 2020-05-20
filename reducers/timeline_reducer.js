/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_END_TIME, CHANGE_START_TIME, ADD_FRIEND, FINALIZE } from "../actions/types";

/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const initState = {
    init_start_y_coord: 148,
    init_end_y_coord: 680,
    start_y_coord: 148, // coordinates used to ensure start draggable component doesnt exceed the end
    end_y_coord: 680,
    initial_time: 8,
    end_time: 24,
    time_interval: 24 - 8,
    final_initial_time: 8,
    final_end_time: 24,
    final_time_interval: 24 - 8
}

export default function (state = initState, action) {
    switch (action.type) {
        case CHANGE_END_TIME:
            return Object.assign({}, state, {
                initial_time: state.initial_time,
                end_time: action.payload,
                time_interval: (action.payload - state.initial_time) <= 0 ? 0 : (action.payload - state.initial_time),
                end_y_coord: action.end_y_coord
            });
        case CHANGE_START_TIME:
            return Object.assign({}, state, {
                initial_time: action.payload,
                end_time: state.end_time,
                time_interval: (state.end_time - action.payload) <= 0 ? 0 : (state.end_time - action.payload),
                start_y_coord: action.start_y_coord
            })
        case FINALIZE:
            return Object.assign({}, state, {
                final_time_interval: state.time_interval
            })
        case ADD_FRIEND:
            return Object.assign({}, state, {
                init_start_y_coord: state.init_start_y_coord,
                init_end_y_coord: state.init_end_y_coord,
                inital_time: 8,
                end_time: 24,
                time_interval: 24 - 8,
                start_y_coord: 148,
                end_y_coord: 680
            })
        default:
            return state;
    }
}

