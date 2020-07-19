import { ADDING_FAVOURITES, ADD_FAVOURITES_TO_PLAN, ADDING_FAVOURITES_TO_EXISTING_BOARD } from './types';

export const setAddingFavourites = (values) => dispatch => {
    const newState = {
        type: ADDING_FAVOURITES,
        payload: values
    }
    dispatch(newState);
}

export const addFavouritesToPlan = (values) => dispatch => {
    console.log("Action called")
    const newState = {
        type: ADD_FAVOURITES_TO_PLAN,
        payload: values
    }
    dispatch(newState);
}

export const setAddingFavouritesToExistsingBoard = (values) => dispatch => {
    const newState = {
        type: ADDING_FAVOURITES_TO_EXISTING_BOARD,
        payload: values
    }
    dispatch(newState);
}