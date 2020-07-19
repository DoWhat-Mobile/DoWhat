import { ADDING_FAVOURITES } from "../actions/types";

const initState = {
    isAddingFavourites: false,
};

export default function (state = initState, action) {
    switch (action.type) {
        case ADDING_FAVOURITES:
            return Object.assign({}, state, {
                isAddingFavourites: action.payload,
            });
        default:
            return state;
    }
}
