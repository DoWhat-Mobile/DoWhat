import { CHANGE_START_TIME, CHANGE_END_TIME, ADD_FRIEND, FINALIZE } from "./types";

/**
 * File defining actions for timeline input feature of application
 */
export const change_start_time = (event, gestureState) => dispatch => {
    const initY = 100 + 48; // At Y.coord = 48, represents starting time: 0800hrs 
    const curY = gestureState.moveY < 148 ? 148 : (gestureState.moveY > 660 ? 660 : gestureState.moveY); // Limit movement
    var time = 8 + (Math.floor((curY - initY) / 16) * 0.5); // Time in hrs
    const newState = {
        type: CHANGE_START_TIME,
        payload: time,
        start_y_coord: gestureState.moveY
    }

    dispatch(newState);
}

/**
 * Action creator that creates the action to change end_time for timeline
 */
export const change_end_time = (event, gestureState) => dispatch => {
    const initY = 100 + 560; // End time: 2359hrs
    const curY = gestureState.moveY > 660 ? 660 : (gestureState.moveY < 148 ? 148 : gestureState.moveY); // Limit movement
    var time = 24 - (Math.floor((initY - curY) / 16) * 0.5);
    const newState = {
        type: CHANGE_END_TIME,
        payload: time,
        end_y_coord: gestureState.moveY
    }

    dispatch(newState);
}

/**
 * Action creator that adds friend's timeline to the list of available timings
 */
export const add_friend = () => dispatch => {
    const newState = {
        type: ADD_FRIEND,
    }

    dispatch(newState);
}

/**
 * Action creator that finalizes timeline input
 */
export const finalize = () => dispatch => {
    const newState = {
        type: FINALIZE,
    }

    dispatch(newState);
}