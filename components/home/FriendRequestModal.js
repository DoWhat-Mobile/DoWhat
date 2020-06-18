import React, { useEffect } from "react";
import {
    View, Text, StyleSheet, Button, TouchableOpacity,
    Dimensions, SectionList, Image
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';
import { removeFriend, findFriends } from '../../actions/friends_actions';
import firebase from '../../database/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FriendRequestModal = ({ navigation, userID, removeFriend, findFriends, allFriends, onClose }) => {
    useEffect(() => {
        showFriendRequests();
    })

    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [currUserName, setCurrUserName] = React.useState('')
    const [friendRequests, setFriendRequests] = React.useState([]);

    const showFriendRequests = () => {
        firebase.database()
            .ref('users/' + userID) // Current user using the app
            .once('value')
            .then((snapshot) => {
                const user = snapshot.val();
                if (user.hasOwnProperty('friends')) {
                    if (user.friends.hasOwnProperty('requests')) {
                        const allFriendRequests = user.friends.requests;
                        addToState(allFriendRequests);

                    }
                }
            }
            )
    }

    const addToState = (allFriendRequests) => {
        var friends = [];
        for (var user in allFriendRequests) {
            // [name, userID]
            const formattedUser = [user, allFriendRequests[user]];
            friends.push(formattedUser);

        }
        setFriendRequests([...friends]);
    }

    // Not functional yet
    const refreshPage = () => {
        setIsRefreshing(true);
        setIsRefreshing(false);
    }

    const findFriendsFromFirebase = () => {
        firebase.database()
            .ref("users")
            .once("value")
            .then((snapshot) => {
                const allAppUsers = snapshot.val();
                renderToView(allAppUsers);
            })
    }

    const handleAddFriend = (push_token, name, firebaseUID) => {
        sendFriendRequest(name, firebaseUID);
        // sendPushNotification(push_token, name);
        removeFriend(firebaseUID, allFriends); // allFriends is current state

    }

    const sendFriendRequest = async (name, firebaseUID) => {
        const requestSender = userID; // Current app userID from Redux State
        const status = {};
        status[currUserName] = requestSender;
        try {
            firebase.database()
                .ref("users/" + firebaseUID) // This is the friend that we are adding's UID
                .child('friends')
                .child('requests')
                .update(status)
        } catch (err) {
            console.log("Error adding friend to Firebase, ", err);
        }
    }

    const sendPushNotification = async (push_token, name) => {
        const message = {
            to: push_token, // from user's Firebase node 
            sound: 'default',
            title: 'Friend Request',
            body: name + ' wants to add you as a friend!',
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

    // Format for use in <SectionList>
    const ListItem = (user, firebaseUID) => {
        return (
            <View style={{ width: Dimensions.get('window').width }}
            >
                <Card
                    style={{ height: (Dimensions.get('window').height / 2) }}
                    title={user.first_name}
                    id={firebaseUID} // Props here used for filtering after Add friend is clicked
                >
                    <Image
                        source={{ uri: user.profile_picture_url }}
                        style={{ height: 50, width: 50, borderRadius: 100 }}
                    />
                    <Button title="Add Friend"
                        onPress={() => handleAddFriend(user.push_token, user.first_name, firebaseUID)} />
                </Card>
            </View>
        );
    }

    // Check if requests has been sent before, prevents spamming from a user.
    const friendRequestAlreadySent = (user) => {
        // Check if there is even a user node
        if (user.hasOwnProperty('friends')) {
            if (user.friends.hasOwnProperty('requests')) {
                const allFriendRequests = user.friends.requests;

                for (var requestee in allFriendRequests) {
                    if (userID == allFriendRequests[requestee]) {
                        return true;
                    }
                }
                return false; // If friend request not sent before.

            }
            return false; // No requests node, means not sent before

        }
        return false; // No friend node, means not sent before
    }

    // Check if request has been rejected by the requetee before 
    const friendRequestAlreadyAccepted = (user) => {
        // Check if there is even a user node
        if (user.hasOwnProperty('friends')) {
            if (user.friends.hasOwnProperty('accepted')) {
                const allFriendRequestsAccepts = user.friends.accepted;

                for (var requestee in allFriendRequestsAccepts) {
                    if (userID == allFriendRequestsAccepts[requestee]) {
                        return true;
                    }
                }
                return false; // If friend request not sent before.

            }
            return false; // No requests node, means not sent before

        }
        return false; // No friend node, means not sent before
    }

    // Check if request has been rejected by the requetee before 
    const friendRequestAlreadyRejected = (user) => {
        // Check if there is even a user node
        if (user.hasOwnProperty('friends')) {
            if (user.friends.hasOwnProperty('rejected')) {
                const allFriendRequestsRejects = user.friends.rejected;

                for (var requestee in allFriendRequestsRejects) {
                    if (userID == allFriendRequestsRejects[requestee]) {
                        return true;
                    }
                }
                return false; // If friend request not sent before.

            }
            return false; // No requests node, means not sent before

        }
        return false; // No friend node, means not sent before
    }

    // Update component state
    const removeFromFriendList = (friendID) => {
        const currFriends = [...friendRequests];
        const newState = currFriends.filter(friend => friend[1] !== friendID); // friend -> [name, userID]
        setFriendRequests([...newState]);
    }

    const acceptFriendRequest = (name, friendID) => {
        // Update from Firebase
        let database = firebase.database();
        const status = {};
        status[name] = friendID;

        // Accept friend
        database.ref("users/" + userID) // Look at current user's Firebase nod 
            .child('friends')
            .child('accepted') // Add friend to the list of accepted friends
            .update(status)

        // Update Firebase
        database.ref("users/" + userID) // UserID from redux state
            .child('friends')
            .child('requests/' + name) // Remove friend from requested friends
            .remove()

        removeFromFriendList(friendID);
    }

    const rejectFriendRequest = (name, friendID) => {
        // Update from Firebase
        let database = firebase.database();
        const status = {};
        status[name] = friendID;

        // Accept friend
        database.ref("users/" + userID) // Look at current user's Firebase nod 
            .child('friends')
            .child('rejected') // Add friend to the list of accepted friends
            .update(status)

        // Update Firebase
        database.ref("users/" + userID) // UserID from redux state
            .child('friends')
            .child('requests/' + name) // Remove friend from requested friends
            .remove()

        removeFromFriendList(friendID);
    }

    /**
     * Returns an Array of React injected elements used as data for <SectionList> 
     * @param {*} allAppUsers 
     */
    const renderToView = (allAppUsers) => {
        var moreUsers = [];
        for (var id in allAppUsers) { // Find all users in database (This doesnt scale well with size...)
            const user = allAppUsers[id];

            if (userID == id) { // Comparing ID in redux state with ID from loop
                setCurrUserName(user.first_name + '_' + user.last_name); // For identification when adding friend request to Firebase
                continue; // Dont display yourself as a friend to be added

            }
            if (friendRequestAlreadySent(user) || friendRequestAlreadyRejected(user)
                || friendRequestAlreadyAccepted(user)) continue;

            const formattedUser = [user, id];
            moreUsers.push(formattedUser);

        }

        if (moreUsers.length == 0) { // no more friends found
            alert("You have sent requests to all users already")
        }

        findFriends([...moreUsers]); // Add to redux state
    }

    const renderFriends = (name, userID) => {
        return (
            <View style={styles.friend}>
                <Text style={{ marginLeft: '2%' }}>{name.replace('_', ' ')}</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={[styles.icon, { backgroundColor: '#00a896' }]}
                        onPress={() => acceptFriendRequest(name, userID)}>
                        <MaterialCommunityIcons name="check" color={'black'} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.icon, { backgroundColor: '#b5838d' }]}
                        onPress={() => rejectFriendRequest(name, userID)}>
                        <MaterialCommunityIcons name="close" color={'black'} size={20} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton}
                    onPress={() => findFriendsFromFirebase()}>
                    <Text> Find Friends</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
                <Text style={{ marginLeft: 20, fontSize: 20, fontFamily: 'serif' }}> Friend Requests </Text>
                <View style={styles.friendRequests}>
                    <SectionList
                        onRefresh={() => refreshPage()}
                        progressViewOffset={100}
                        refreshing={isRefreshing}
                        sections={[
                            { title: "", data: friendRequests },
                        ]}
                        renderItem={({ item }) => renderFriends(item[0], item[1])} // Each item is [userDetails, UserID]
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

                <View style={styles.findFriends}>
                    <SectionList
                        onRefresh={() => refreshPage()}
                        progressViewOffset={100}
                        refreshing={isRefreshing}
                        sections={[
                            { title: "", data: allFriends },
                        ]}
                        renderItem={({ item }) => ListItem(item[0], item[1])} // Each item is [userDetails, UserID]
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
        </View>
    );
};

const mapStateToProps = (state) => {
    console.log("All friends length is: ", state.add_friends.allFriends.length)
    return {
        userID: state.add_events.userID,
        allFriends: state.add_friends.allFriends
    };
};

const mapDispatchToProps = {
    removeFriend, findFriends
};

export default connect(mapStateToProps, mapDispatchToProps)(FriendRequestModal);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: "center",
    },
    headerButton: {
        flex: 1,
        justifyContent: "center",
        alignSelf: 'flex-start',
        borderRadius: 100,
        paddingRight: 15,
        paddingLeft: 15,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: '5%',
        borderWidth: 1,
    },
    body: {
        flex: 7,
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

    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-between',
        padding: 5,

    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
    icon: {
        borderWidth: 1,
        borderRadius: 5,

    },
    title: {
        fontSize: 32,
    },
});