import { CHANGE_START_TIME, CHANGE_END_TIME } from "./types";

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
        start_Y_Coord: gestureState.moveY
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
        end_Y_Coord: gestureState.moveY
    }

    dispatch(newState);
}
