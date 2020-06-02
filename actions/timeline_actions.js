import { CHANGE_TIME, ADD_FRIEND, GO_BACK, GO_FORWARD } from "./types";

/**
 *  Action creator that changes the start and end time state
 */
export const changeTime = (values) => (dispatch) => {
  const newState = {
    type: CHANGE_TIME,
    payload: values,
  };
  dispatch(newState);
};

/**
 * Saves the state of the current user's startTime and endTime, before 
 * starting afresh for the new friend. 
 * @param {} values is a object which has the user's start and end time. 
 */
export const addFriend = (values) => dispatch => {
  const newState = {
    type: ADD_FRIEND,
    payload: values
  };
  dispatch(newState);
}

/**
 * Toggle back to the previous user to edit the previous user's start and end time.
 * @param {*} values 
 */
export const goBack = () => dispatch => {
  const newState = {
    type: GO_BACK,
  };
  dispatch(newState);
}

/**
 * Toggle forward to the next user to edit the next user's start and end time.
 * @param {*} values 
 */
export const goForward = () => dispatch => {
  const newState = {
    type: GO_FORWARD,
  };
  dispatch(newState);
}