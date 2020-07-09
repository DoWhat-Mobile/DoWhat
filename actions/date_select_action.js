import { DATE_SELECT, USER_LOCATION } from './types';

export const selectDate = (values) => dispatch => {
    const newState = {
        type: DATE_SELECT,
        payload: values,
    }
    dispatch(newState);
};

export const setLocation = (values) => dispatch => {
    const newState = {
        type: USER_LOCATION,
        payload: values
    }
    dispatch(newState);
}