/**
 * File for all the reducers invovled in the timeline input feature of the application
 */
import { CHANGE_END_TIME, CHANGE_START_TIME } from "../actions/types";

export default function (state = {}, action) {
    switch (action.type) {
        case CHANGE_END_TIME:
            return {};
        case CHANGE_START_TIME:
            return {};
        default:
            return state;
    }
}

