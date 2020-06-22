import { REMOVE_FRIEND, FIND_FRIENDS } from '../actions/types';

const initState = {
    allFriends: [],
}

const handleRemoveFriend = (userID, allFriends) => {
    // Remove user from list view once request has been sent 
    const currState = [...allFriends] // Clone array
    for (var i = 0; i < currState.length; i++) {
        if (currState[i][1] == userID) {
            currState[i][2] = true; // Indicate that friend request has been sent
        }
    }
    return currState;
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