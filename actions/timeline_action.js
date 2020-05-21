import { ADD_FRIEND, FINALIZE, CHANGE_TIME } from "./types";
import { cloneElement } from "react";

/**
 *  Action creator that changes the start and end time state
 */
export const change_time = (values) => dispatch => {
    const newState = {
        type: CHANGE_TIME,
        payload: values,

    }
    dispatch(newState);
}

/**
 * Action creator that adds friend's timeline to the list of available timings
 */
export const add_friend = (values) => dispatch => {
    const newState = {
        type: ADD_FRIEND,
        payload: values,
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