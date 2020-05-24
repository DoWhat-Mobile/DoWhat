import { CHANGE_TIME, CHANGE_INTERVAL, RESET_INTERVAL } from "./types";

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
export const change_interval = (values) => dispatch => {
    const newState = {
        type: CHANGE_INTERVAL,
        payload: values,
    }

    dispatch(newState);
}

/**
 * Action creator to reset timeline interval when user inputs the wrong timings
 */
export const reset_interval = (values) => dispatch => {
    const newState = {
        type: RESET_INTERVAL,
        payload: values,
    }

    dispatch(newState);
}