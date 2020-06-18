import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Dimensions, SectionList, Image } from "react-native";
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';
import { removeFriend, findFriends } from '../../actions/friends_actions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from '../../database/firebase';

const AllFriends = ({ navigation, userID, removeFriend, findFriends, allFriends }) => {
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [currUserName, setCurrUserName] = React.useState('')

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
            if (friendRequestAlreadySent(user)) continue;

            const formattedUser = [user, id];
            moreUsers.push(formattedUser);
        }

        findFriends([...moreUsers]); // Add to redux state
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton}
                    onPress={() => findFriendsFromFirebase()}>
                    <MaterialCommunityIcons name="account-plus" color={'black'} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
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
    );
}

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

export default connect(mapStateToProps, mapDispatchToProps)(AllFriends);

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
        alignSelf: 'flex-end',
        borderRadius: 100,
        paddingRight: 10,
        paddingLeft: 10,
        marginTop: 20,
        marginBottom: 20,
        marginRight: '5%',
        borderWidth: 1,
    },
    addFriendButton: {
        borderWidth: 1,
        justifyContent: 'flex-end'

    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
    },
});