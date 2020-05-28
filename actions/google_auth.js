import { SET_ACCESS_TOKEN } from "./types";

/**
 * Action creator to set Google access token to redux state. For future use in calendar API call.
 */
export const set_access_token = (googleUser) => (dispatch) => { //Entire googleUser object is passed in.
    const newState = {
        type: SET_ACCESS_TOKEN,
        payload: googleUser
    }

    dispatch(newState);
}