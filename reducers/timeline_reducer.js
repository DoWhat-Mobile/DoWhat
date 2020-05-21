/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_TIME, ADD_FRIEND, FINALIZE } from "../actions/types";

/**
 * Keep track of start time, end time and time interval for scheduleing of events
 */
const initState = {
    values: [8, 24],
    time_interval: [8, 24],
    //errorMessage: false // Boolean flag to check if new person's schedule doesnt match other schedules
}

/**
 * Helper method for logic of finding overlapping time interval between friends
 */
const add_friend = (state, action) => {
    const cur_time_interval = action.payload;
    let final_time_interval = state.time_interval;

    let a = [0, 0];
    if (cur_time_interval[1] < final_time_interval[0] || cur_time_interval[0] > final_time_interval[1]) {
        return {
            ...state,
            values: [8, 24],
            time_interval: final_time_interval,
            errorMessage: true
        };
    } else {
        // Take bigger start time
        a[0] = final_time_interval[0] = cur_time_interval[0] < final_time_interval[0] ? final_time_interval[0] : cur_time_interval[0];
        // Take smaller end time
        a[1] = final_time_interval[1] = cur_time_interval[1] < final_time_interval[1] ? cur_time_interval[1] : final_time_interval[1]
        return {
            ...state,
            values: [8, 24],
            time_interval: a,
            errorMessage: false
        };
    }
}

export default function (state = initState, action) {
    switch (action.type) {
        case CHANGE_TIME:
            return Object.assign({}, state, {
                values: action.payload
            });
        case FINALIZE:
            return Object.assign({}, state, {

            })
        case ADD_FRIEND:
            return add_friend(state, action);
        default:
            return state;
    }
}

