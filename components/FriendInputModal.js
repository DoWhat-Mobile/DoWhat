import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    SectionList
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import firebase from '../database/firebase';

/**
 * Modal that shows when user clicks "Invite friends from DoWhat" in FriendInput.js
 */
const FriendInputModal = ({ onClose, userID, selected_date, database }) => {
    useEffect(() => {
        showAllMyFriends(); // All accepted friends
    }, []);

    const [allAcceptedFriends, setAllAcceptedFriends] = useState([]);
    const [currUserName, setCurrUserName] = useState('')

    const showAllMyFriends = () => {
        firebase.database()
            .ref()
            .once("value")
            .then((snapshot) => {
                const database = snapshot.val();
                const user = database.users[userID];
                setCurrUserName(user.first_name + '_' + user.last_name); // For identification when adding friend request to Firebase
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
            if (collab_boards.hasOwnProperty(userID)) { // Board ID of current user
                const board = collab_boards[userID];
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
            var formattedUser = [user, allFriends[user],
                userAlreadyInvited(allFriends[user])]; // [name, userID, true/false]
            friends.push(formattedUser);
        }
        setAllAcceptedFriends([...friends]);
    }

    /**
     * Update process:
     * 1) Get information from Firebase, and create a board with a unique board ID
     * 2) The board ID is the curr inviter's Firebase UID.
     * 3) Add a pointer with the board ID to all the invited people so they can reference it. 
     */
    const updateCollabBoard = (userGmail, inviteeBusyPeriods, currUserName, currUserID, inviteeName, inviteeID) => {
        const uniqueBoardID = currUserID;
        const formattedUserEmail = userGmail.replace(/\./g, '@').slice(0, -10); // Firebase cant have '@' 

        // Store a pointer to the main board from each invitee's DB
        var pointerToBoard = {}
        pointerToBoard['/users/' + inviteeID + '/collab_boards/' + currUserName] = uniqueBoardID
        pointerToBoard['/users/' + currUserID + '/collab_boards/' + 'my_board'] = uniqueBoardID

        var updates = {};
        updates['/selected_date'] = selected_date; // selected_date from Redux state
        updates['/invitees/' + inviteeName] = inviteeID; // Add to list of invitees
        updates['/invitees/' + currUserName] = userID; // Add to list of invitees
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
                japanese: 0, cafe: 0, local: 0
            },
            price: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
        };
        updates['/availabilities/' + formattedUserEmail] = inviteeBusyPeriods;

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
                const currUserGmail = currUser.gmail;
                const currUserName = currUser.first_name + '_' + currUser.last_name;
                var currUserBusyPeriods = {};
                if (currUser.hasOwnProperty('busy_periods')) {
                    currUserBusyPeriods = currUser.busy_periods;
                }
                updateCollabBoard(currUserGmail, currUserBusyPeriods, currUserName, userID, name, inviteeID);
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

    // Format the data into the list
    const renderFriends = (name, userID, requested) => {
        if (!requested) {
            return (
                <View style={styles.friend}>
                    <Text style={{ marginLeft: '2%' }}>{name.replace('_', ' ')}</Text>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={{ borderWidth: 1, borderRadius: 10, padding: 5 }}
                            onPress={() => inviteForCollab(name, userID)}>
                            <Text>Invite</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={styles.friend}>
                    <Text style={{ marginLeft: '2%' }}>{name.replace('_', ' ')}</Text>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={{ borderWidth: 1, borderRadius: 10, padding: 5, backgroundColor: 'green' }}
                            onPress={() => inviteForCollab(name, userID)}>
                            <Text style={{ color: 'white' }}>Invited</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style>
                    <Text style={styles.headerText}>Your Friends</Text>
                </View>
                <AntDesign
                    name="close"
                    size={24}
                    onPress={() => onClose()}
                    style={styles.close}
                />
            </View>

            <View style={styles.body}>
                <SectionList
                    progressViewOffset={100}
                    sections={[
                        { title: "", data: allAcceptedFriends },
                    ]}
                    renderItem={({ item }) => renderFriends(item[0], item[1], item[2])} // Each item is [userDetails, UserID]
                    renderSectionHeader={({ section }) =>
                        <View style={styles.sectionHeader}>
                            <TouchableOpacity
                                onPress={() => handleTitlePress(section.title)}>
                                <Text style={styles.sectionHeaderText}>{section.title}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    keyExtractor={(item, index) => index}
                />
            </View>
        </View>
    );
};

const formatDateToString = (date) => {
    const year = date.getFullYear().toString();
    var month = date.getMonth() + 1; // Offset by 1 due to Javascrip Date object format
    month = month >= 10 ? month.toString() : "0" + month.toString();
    const day = date.getDate().toString();
    const dateString = year + "-" + month.toString() + "-" + day;
    return dateString;
};

// Get previously inputted date from DateSelection for API call
const mapStateToProps = (state) => {
    const dateInString = formatDateToString(state.date_select.date);
    return {
        selected_date: dateInString,
        userID: state.add_events.userID,
    };
};

export default connect(mapStateToProps, null)(FriendInputModal);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '15%',
        marginLeft: '8%',
        fontFamily: 'serif'

    },
    headerButton: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'flex-end',
        borderRadius: 100,
        paddingRight: 15,
        paddingLeft: 15,
        paddingBottom: 25,
        paddingTop: 25,
        marginBottom: 10,
        marginRight: '5%',
        borderWidth: 1,
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
});
