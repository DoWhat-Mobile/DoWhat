
import {
    ADD_EVENTS, EXTRACT_CALENDAR_EVENTS,
    ADD_UID, ADD_PROFILE_PICTURE, ADD_CURR_USER_NAME
} from './types';

export const addEvents = (values) => dispatch => {
    const newState = {
        type: ADD_EVENTS,
        payload: values,
    }
    dispatch(newState);
};

export const addUID = (values) => dispatch => {
    const newState = {
        type: ADD_UID,
        payload: values,
    }
    dispatch(newState);
};

export const addProfilePicture = (values) => dispatch => {
    const newState = {
        type: ADD_PROFILE_PICTURE,
        payload: values,
    }
    dispatch(newState);
};

export const addCurrUserName = (values) => dispatch => {
    const newState = {
        type: ADD_CURR_USER_NAME,
        payload: values,
    }
    dispatch(newState);
};

export const extractCalendarEvents = (values) => dispatch => {
    console.log("Succesfully dispatched to redux")
    const newState = {
        type: EXTRACT_CALENDAR_EVENTS,
        payload: values,
    }
    dispatch(newState);
};