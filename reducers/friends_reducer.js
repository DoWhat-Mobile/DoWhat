import { REMOVE_FRIEND, FIND_FRIENDS } from '../actions/types';

const initState = {
    allFriends: [],
}

const handleRemoveFriend = (userID, allFriends) => {
    // Remove user from list view once request has been sent 
    const currState = [...allFriends] // Clone array
    const newState = currState.filter(elt => {
        return elt[1] !== userID;
    })
    return newState;
}

export default function (state = initState, action) {
    switch (action.type) {
        case REMOVE_FRIEND:
            return { allFriends: handleRemoveFriend(action.payload, action.allFriends) };
        case FIND_FRIENDS:
            return { allFriends: action.payload };
        default:
            return state;
    }
}