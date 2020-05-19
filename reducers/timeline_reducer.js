/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_END_TIME, CHANGE_START_TIME } from "../actions/types";

const initState = {
    initial_time: 8,
    end_time: 24,
}

export default function (state = initState, action) {
    switch (action.type) {
        case CHANGE_END_TIME:
            return Object.assign({}, state, {
                initial_time: state.inital_time,
                end_time: action.payload
            });
        case CHANGE_START_TIME:
            return Object.assign({}, state, {
                initial_time: action.payload,
                end_time: state.end_time
            });
        default:
            return state;
    }
}

