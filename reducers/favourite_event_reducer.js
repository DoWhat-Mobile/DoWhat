import { ADDING_FAVOURITES, ADD_FAVOURITES_TO_PLAN, ADDING_FAVOURITES_TO_EXISTING_BOARD } from "../actions/types";

const initState = {
    isAddingFavourites: false,
    isAddingFavouritesToExistingBoard: false,
    favouriteEvents: []
};

export default function (state = initState, action) {
    switch (action.type) {
        case ADDING_FAVOURITES:
            return Object.assign({}, state, {
                isAddingFavourites: action.payload,
            });
        case ADDING_FAVOURITES_TO_EXISTING_BOARD:
            return Object.assign({}, state, {
                isAddingFavouritesToExistingBoard: action.payload,
            });
        case ADD_FAVOURITES_TO_PLAN:
            console.log("Adding favourtes : ", action.payload)
            return Object.assign({}, state, {
                favouriteEvents: action.payload,
            });
        default:
            return state;
    }
}
