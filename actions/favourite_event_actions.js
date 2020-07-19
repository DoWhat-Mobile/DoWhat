import { ADDING_FAVOURITES } from './types';

export const setAddingFavourites = (values) => dispatch => {
    const newState = {
        type: ADDING_FAVOURITES,
        payload: values
    }
    dispatch(newState);
}