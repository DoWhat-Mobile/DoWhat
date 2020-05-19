import { CHANGE_START_TIME, CHANGE_END_TIME } from "./types";

/**
 * File defining actions for timeline input feature of application
 */
export const change_start_time = (event, gestureState) => dispatch => {
    const initY = 48; // At Y.coord = 48, represents starting time: 0800hrs 
    const curY = gestureState.moveY;
    const time = 8 + (Math.floor((curY - initY) / 16) * 0.5); // Time in hrs
    const newState = {
        type: CHANGE_START_TIME,
        payload: time
    }

    dispatch(newState);
}

/**
 * Action creator that creates the action to change end_time for timeline
 */
export const change_end_time = (event, gestureState) => dispatch => {
    const initY = 560; // End time: 2359hrs
    const curY = gestureState.moveY;
    const time = 24 - (Math.ceil((initY - curY) / 16) * 0.5);
    const newState = {
        type: CHANGE_END_TIME,
        payload: time
    }

    dispatch(newState);
}
