import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList
} from "react-native";
import { connect } from 'react-redux';
import firebase from '../database/firebase';
import { Avatar } from 'react-native-elements';
import { formatDateToString } from '../reusable-functions/GoogleCalendarGetBusyPeriods';

/**
 * Child component of FriendInput, displays the friends that can be invited, and holds
 * the logic of inviting friends for collaboration. 
 */
const FriendsDisplay = ({ userID, currUserName, selected_date, database,
    currUserPreferenceArr, currUserFoodFilterObj }) => {
    useEffect(() => {
        showAllMyFriends(); // All accepted friends
    }, []);

    const [allAcceptedFriends, setAllAcceptedFriends] = useState([]);

    const showAllMyFriends = () => {
        firebase.database()
            .ref()
            .once("value")
            .then((snapshot) => {
                const database = snapshot.val();
                const user = database.users[userID];
                if (user.hasOwnProperty('friends')) {
                    if (user.friends.hasOwnProperty('accepted')) {
                        const allAcceptedFriends = user.friends.accepted;
                        addToState(allAcceptedFriends);
                    }
                }
            })
    }

    // Check Firebase whether invitation was already sent
    const userAlreadyInvited = (inviteeID) => {
        if (database.hasOwnProperty('collab_boards')) {
            const collab_boards = database.collab_boards;
            const boardID = userID + '_' + selected_date;
            if (collab_boards.hasOwnProperty(boardID)) { // Board ID of current user
                const board = collab_boards[boardID];
                const invitees = board.invitees;
                for (var person in invitees) {
                    if (invitees[person] == inviteeID) {
                        return true;
                    }
                }
                return false;
            }
            return false;
        }
        return false;
    }

    // Add all accepted friends to component state
    const addToState = (allFriends) => {
        var friends = [];
        for (var user in allFriends) {
            var formattedUser = [user, allFriends[user].firebase_id,
                userAlreadyInvited(allFriends[user]),
                allFriends[user].picture_url]; // [name, userID, true/false, profilePicURL]
            friends.push(formattedUser);
        }
        setAllAcceptedFriends(friends);
    }

    const createUniqueBoardID = (currUser, currUserID) => {
        const id = currUserID + '_' + selected_date;
        return id;
    }

    // Takes update object (to update Firebase), and includes the selected curr user preferences
    const addCurrUserPreferences = (updates) => {
        currUserPreferenceArr.forEach((preference) => {
            updates['/preferences'][preference] += 1
        })

        const areaSelectedArr = currUserFoodFilterObj.area;
        const cuisineSelectedArr = currUserFoodFilterObj.cuisine;
        const priceSelected = currUserFoodFilterObj.price;

        cuisineSelectedArr.forEach(cuisine => {
            updates['/food_filters'].cuisine[cuisine.toLowerCase()] += 1;
        })

        areaSelectedArr.forEach(area => {
            updates['/food_filters'].area[area.toLowerCase()] += 1;
        })
        updates['/food_filters'].price[priceSelected] += 1;
        return updates;
    }

    /**
     * Update process:
     * 1) Get information from Firebase, and create a board with a unique board ID
     * 2) The board ID is the curr inviter's Firebase UID.
     * 3) Add a pointer with the board ID to all the invited people so they can reference it. 
     */
    const updateCollabBoard = (currUser, inviteeBusyPeriods, currUserName, currUserID, inviteeName, inviteeID) => {
        const userGmail = currUser.gmail;
        const uniqueBoardID = createUniqueBoardID(currUser, currUserID);
        const formattedUserEmail = userGmail.replace(/\./g, '@').slice(0, -10); // Firebase cant have '@' 

        // Store a pointer to the main board from each invitee's DB
        var pointerToBoard = {}
        pointerToBoard['/users/' + inviteeID + '/collab_boards/' + uniqueBoardID] = currUserName;
        pointerToBoard['/users/' + currUserID + '/collab_boards/' + uniqueBoardID] = 'my_board';

        var updates = {};
        updates['/selected_date'] = selected_date; // selected_date from Redux state
        updates['/invitees/' + inviteeName] = inviteeID; // Add to list of invitees
        updates['/invitees/' + currUserName] = userID; // Add to list of invitees
        updates['/availabilities/' + formattedUserEmail] = inviteeBusyPeriods;
        updates['host'] = currUserName;
        updates['/isNewlyAddedBoard'] = true;

        updates['/preferences'] = {
            adventure: 0,
            arts: 0,
            leisure: 0,
            nature: 0,
            nightlife: 0,
            food: 0
        }
        updates['/food_filters'] = {
            area: { north: 0, east: 0, west: 0, central: 0 },
            cuisine: {
                asian: 0, western: 0, chinese: 0, korean: 0, indian: 0,
                japanese: 0, cafe: 0, hawker: 0
            },
            price: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
        };

        updates = addCurrUserPreferences(updates);

        firebase.database()
            .ref('collab_boards') // Create a collab board in Firebase
            .child(uniqueBoardID) // Name it using a unique board ID
            .update(updates);

        // Add key to invitee as well as inviter Firebase node, so user can reference later
        firebase.database()
            .ref()
            .update(pointerToBoard);
    }

    /**
     * Process of collab invite:
     * 1) Get invitee push token, and send a push notification that invitation for collaboration
     * 2) Get curr user's availabilities, gmail, name, and ID
     * 3) Create a new collaboration board with the given information 
     */
    const inviteForCollab = (name, inviteeID) => {
        // Get push token, and other collaboration data
        firebase.database()
            .ref()
            .once("value")
            .then((snapshot) => {
                const database = snapshot.val();
                const invitee = database.users[inviteeID];
                const pushToken = invitee.push_token; // To send push notification
                sendPushNotification(pushToken, name)

                const currUser = database.users[userID]; // UserID from Redux State
                var currUserBusyPeriods = {};
                if (currUser.hasOwnProperty('busy_periods')) {
                    currUserBusyPeriods = currUser.busy_periods;
                }
                updateCollabBoard(currUser, currUserBusyPeriods, currUserName, userID, name, inviteeID);
            })
        removeInvitedFriendFromList(inviteeID)
    }

    // Update component state
    const removeInvitedFriendFromList = (inviteeID) => { // Remove by setting an 'invited' marker
        const currFriends = [...allAcceptedFriends];
        for (var i = 0; i < currFriends.length; i++) {
            if (currFriends[i][1] == inviteeID) {
                currFriends[i][2] = true; // Indicate that friend request has been sent
            }
        }
        setAllAcceptedFriends([...currFriends]);
    }

    // API call format
    const sendPushNotification = async (push_token, name) => {
        const message = {
            to: push_token, // from user's Firebase node 
            sound: 'default',
            title: 'Collaboration Invite',
            body: currUserName + ' is inviting you to collaborate on an outing!',
            data: { data: 'goes here' },
            _displayInForeground: true,
        };
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }

    // Format the data into the Flat List Component 
    const renderIndividualFriends = (name, userID, requested, pictureURL) => {
        const inviteButton = () => {
            if (!requested) {
                return (
                    <TouchableOpacity onPress={() => inviteForCollab(name, userID)}
                        style={styles.addFriendButton}>
                        <Text style={{
                            fontWeight: 'bold', fontSize: 12, textAlign: 'center',
                            color: '#1d3557', borderTopColor: '#7AB3EF',
                            borderEndColor: '#6EE2E9', borderLeftColor: '#DED8DE',
                            borderStartColor: '#D6A5D4', borderRightColor: '#DED8DE',
                            borderBottomColor: '#4ACFEA'
                        }}>
                            Invite
                        </Text>
                    </TouchableOpacity>
                )
            }
            return (
                <TouchableOpacity disabled={true}
                    style={[styles.addFriendButton, { backgroundColor: '#1a936f' }]}>
                    <Text style={{
                        fontWeight: 'bold', fontSize: 12, textAlign: 'center',
                        color: '#f0f0f0'
                    }}>
                        Invitation Sent
                </Text>
                </TouchableOpacity>
            )
        }

        return (
            <View style={styles.friendCard}>
                <View style={{ marginLeft: '28%', marginTop: 10 }}>
                    <Avatar
                        rounded
                        source={{
                            uri: pictureURL
                        }}
                        size={50}
                    />
                </View>
                <View style={{ flex: 1, }}>
                    <Text style={styles.nameStyle}>{name.replace(/_/g, ' ')}</Text>
                </View>
                {inviteButton()}
            </View>
        )
    }


    return (
        <View style={styles.container}>
            <FlatList
                data={allAcceptedFriends}
                horizontal={true}
                numColumns={1}
                renderItem={({ item }) => (
                    renderIndividualFriends(item[0], item[1], item[2], item[3])
                )}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    );
};

// Get previously inputted date from DateSelection for API call
const mapStateToProps = (state) => {
    const dateInString = formatDateToString(state.date_select.date);
    return {
        selected_date: dateInString,
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
        currUserPreferenceArr: state.genre.genres[0],
        currUserFoodFilterObj: state.genre.genres[2],
    };
};

export default connect(mapStateToProps, null)(FriendsDisplay);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '15%',
        marginLeft: '8%',
        fontFamily: 'serif'
    },
    body: {
        flex: 8,
        justifyContent: 'center',
    },
    addFriendButton: {
        borderWidth: 1,
        justifyContent: 'flex-end'

    },
    friend: {
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: '5%',
        marginRight: '10%',
        paddingBottom: '2%',
        paddingTop: '2%',
        borderRadius: 8,
        marginTop: 8,

    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-between',
        padding: 5,

    },
    footer: {
        flex: 1,
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
    friendCard: {
        borderWidth: 0.5,
        margin: 8,
        flexShrink: 1,
        borderRadius: 5,
        height: 150,
        width: 120,
    },
    nameStyle: {
        flexWrap: 'wrap',
        textAlign: 'center',
        marginTop: 5,

    },
    addFriendButton: {
        borderWidth: 0.5,
        margin: 5,
        marginTop: 0,
        borderColor: '#1d3557'
    }
});