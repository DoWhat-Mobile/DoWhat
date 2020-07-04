import React, { useEffect } from "react";
import {
    View, Text, StyleSheet, Button, TouchableOpacity,
    Dimensions, SectionList, Image
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { removeFriend, findFriends } from '../../actions/friends_actions';
import firebase from '../../database/firebase';
import { Avatar } from 'react-native-elements';

const FriendRequestModal = ({ userID, onClose, currUserProfilePicture }) => {
    useEffect(() => {
        showFriendRequests();
    }, [])


    const [currUserName, setCurrUserName] = React.useState('')
    const [friendRequests, setFriendRequests] = React.useState([]);

    const showFriendRequests = () => {
        firebase.database()
            .ref('users/' + userID) // Current user using the app
            .once('value')
            .then((snapshot) => {
                const user = snapshot.val();
                setCurrUserName(user.first_name + '_' + user.last_name); // For identification when adding friend request to Firebase
                if (user.hasOwnProperty('friends')) {
                    if (user.friends.hasOwnProperty('requests')) {
                        const allFriendRequests = user.friends.requests;
                        addToState(allFriendRequests);

                    }
                }
            }
            )
    }

    // Add all friend requests to component state
    const addToState = (allFriendRequests) => {
        var friends = [];
        for (var user in allFriendRequests) {
            // [name, userID, profilePicURL]
            const formattedUser = [user, allFriendRequests[user].firebase_id,
                allFriendRequests[user].picture_url];
            friends.push(formattedUser);

        }
        setFriendRequests([...friends]);
    }

    // Update component state
    const removeFromFriendList = (friendID) => {
        const currFriends = [...friendRequests];
        const newState = currFriends.filter(friend => friend[1] !== friendID); // friend -> [name, userID]
        setFriendRequests([...newState]);
    }

    const acceptFriendRequest = (name, friendID, pictureURL) => {
        // Update from Firebase
        let database = firebase.database();

        var updates = {};
        updates['users/' + userID + '/friends/accepted/' + name] = {
            firebase_id: friendID,
            picture_url: pictureURL
        };
        updates['users/' + friendID + '/friends/accepted/' + currUserName] = {
            firebase_id: userID,
            picture_url: currUserProfilePicture
        };

        // Accept friend, update both users since friendship goes both ways
        database.ref().update(updates) // Perform simultanoues update for 2 locations in Firebase

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

    // Show friends that user has already accepted
    const renderFriends = (name, userID, pictureURL) => {
        return (
            <View style={styles.friend}>
                <View style={{ margin: 5, marginTop: 10 }}>
                    <Avatar
                        rounded
                        source={{
                            uri: pictureURL
                        }}
                        size={50}
                    />
                </View>

                <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'column' }}>
                    <Text style={{
                        marginLeft: 10, fontSize: 16,
                        fontWeight: '800', fontFamily: 'serif',
                    }}>
                        {name.replace(/_/g, ' ')}
                    </Text>
                    <Text style={{ color: 'grey', fontSize: 14, fontWeight: '200', marginLeft: 10 }}>
                        Sent a friend request to you
                        </Text>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={[styles.icon,
                        {
                            borderTopColor: '#7AB3EF', borderEndColor: '#6EE2E9', borderLeftColor: '#DED8DE',
                            borderStartColor: '#D6A5D4', borderRightColor: '#DED8DE', borderBottomColor: '#4ACFEA'
                        }]}
                            onPress={() => acceptFriendRequest(name, userID, pictureURL)}>
                            <Text>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.icon, {
                            marginLeft: 20,
                            borderTopColor: '#D6A5D4', borderEndColor: '#A49CF8', borderLeftColor: '#A49CF8',
                            borderStartColor: '#D6A5D4', borderRightColor: '#DED8DE', borderBottomColor: '#D6A5D4'
                        }]}
                            onPress={() => rejectFriendRequest(name, userID)}>
                            <Text>Decline</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{ marginLeft: 20, fontSize: 20, fontFamily: 'serif' }}> Friend Requests </Text>
                <AntDesign
                    name="close"
                    size={24}
                    onPress={() => onClose()}
                    style={styles.close}
                />
            </View>

            <View style={styles.body}>
                <View style={styles.friendRequests}>
                    <SectionList
                        progressViewOffset={100}
                        sections={[
                            { title: "", data: friendRequests },
                        ]}
                        renderItem={({ item }) => renderFriends(item[0], item[1], item[2])}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            </View>

        </View>
    );
};

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        allFriends: state.add_friends.allFriends,
        currUserProfilePicture: state.add_events.profilePicture
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
        borderWidth: 0.5,
        margin: 5,
        borderColor: 'grey',
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-between',
        height: 100,
        width: '70%',
        borderRadius: 8,

    },
    buttonGroup: {
        marginTop: 5,
        flexDirection: 'row',
        marginLeft: 10,

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
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 50,

    },
    title: {
        fontSize: 32,
    },
    card: {
        flexDirection: 'row',
        borderWidth: 1,
        justifyContent: 'flex-start',
        margin: 10,
        marginLeft: 20,
        borderRadius: 10,
        padding: 5,
        width: Dimensions.get('window').width * 0.9

    },
    addFriendButton: {
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: 'black',
        alignContent: 'stretch'

    },
    userName: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: 'serif',
        textAlign: 'center'

    },
    cardComponent: {
        marginLeft: 10,
        padding: 5,
        width: Dimensions.get('window').width * 0.7,

    },
    addFriendButtonText: {
        textAlign: 'center',
    }
});