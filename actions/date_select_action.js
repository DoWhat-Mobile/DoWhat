import { DATE_SELECT } from './types';

export const selectDate = (values) => dispatch => {
    const newState = {
        type: DATE_SELECT,
        payload: values,
    }
    dispatch(newState);
};