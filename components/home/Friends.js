import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, SectionList, Modal
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux';
import { removeFriend, findFriends } from '../../actions/friends_actions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from '../../database/firebase';
import FriendRequestModal from './FriendRequestModal';
import SuggestedFriends from './SuggestedFriends';
import AllSuggestedFriendsModal from './AllSuggestedFriendsModal';
import { Overlay } from 'react-native-elements';
import { Badge } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

const AllFriends = ({ userID }) => {
    useFocusEffect(
        useCallback(() => {
            showAllMyFriends(); // All accepted friends
            findFriendsFromFirebase();
            return () => null;
        }, [])
    )

    const [allAcceptedFriends, setAllAcceptedFriends] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [suggestedFriends, setSuggestedFriends] = useState([]);
    const [allSuggestedFriends, setAllSuggestedFriends] = useState([]);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [noOfFriendRequests, setNoOfFriendRequests] = useState(0);

    const findFriendsFromFirebase = () => {
        firebase.database()
            .ref('users')
            .once("value")
            .then((snapshot) => {
                const allAppUsers = snapshot.val();
                const currUserDetails = allAppUsers[userID]
                getSuggestedFriends(allAppUsers, currUserDetails);
            })
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

    // Check if the person has already sent a friend request to this current user
    const hasPendingFriendRequest = (currRequesteeID, currUserDetails) => {
        if (currUserDetails.hasOwnProperty("friends")) {
            const currUserFriends = currUserDetails.friends;
            if (currUserFriends.hasOwnProperty("requests")) {
                const currUserFriendRequests = currUserFriends.requests;
                const noOfRequests = Object.keys(currUserFriendRequests).length;
                setNoOfFriendRequests(noOfRequests);
                for (var name in currUserFriendRequests) {
                    const requesteeID = currUserFriendRequests[name].firebase_id;
                    if (currRequesteeID == requesteeID) {
                        return true;
                    }
                }
                return false;
            }
            return false;
        }
        return false;
    }

    // Filter out suggested friends from all DoWhat users in Firebase
    const getSuggestedFriends = (allAppUsers, currUserDetails) => {
        var moreUsers = [];
        for (var id in allAppUsers) { // Find all users in database (This doesnt scale well with size...)
            const user = allAppUsers[id];

            if (userID == id) continue; // Dont display yourself as a friend to be added

            if (friendRequestAlreadySent(user) ||
                friendRequestAlreadyRejected(user) ||
                friendRequestAlreadyAccepted(user) ||
                hasPendingFriendRequest(id, currUserDetails)) continue;

            const formattedUser = [user, id, false]; // Last boolean flag is to see if friend request is already sent
            moreUsers.push(formattedUser);

        }

        if (moreUsers.length == 0) { // no more friends found
            return;
        }
        setSuggestedFriends([...moreUsers.slice(0, 4)]) // Limited friends shown
        setAllSuggestedFriends([...moreUsers]);
        setIsLoading(false); // Render screen once data loads
    }

    // Render all the friends that this current user has (accepted)
    const showAllMyFriends = () => {
        firebase.database()
            .ref("users/" + userID)
            .once("value")
            .then((snapshot) => {
                const user = snapshot.val();
                if (user.hasOwnProperty('friends')) {
                    if (user.friends.hasOwnProperty('accepted')) {
                        const allAcceptedFriends = user.friends.accepted;
                        addToState(allAcceptedFriends);
                    }
                }
            })
    }

    const addToState = (allFriends) => {
        var friends = [];
        for (var user in allFriends) {
            // [name, userID]
            const formattedUser = [user, allFriends[user]];
            friends.push(formattedUser);

        }
        setAllAcceptedFriends([...friends]);
    }

    const renderFriends = (name, userID) => {
        return (
            <View style={styles.friend}>
                <Text style={{ marginLeft: '2%' }}>{name.replace('_', ' ')}</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={{ borderWidth: 1, borderRadius: 10, padding: 5 }}
                        onPress={() => alert("More details about user (future enhancement)")}>
                        <Text>More details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const closeModal = () => {
        setModalVisible(false);
    }

    const openOverlay = () => {
        setOverlayVisible(true);
    }

    const closeOverlay = () => {
        setOverlayVisible(false);
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    }

    const renderAllAcceptedFriends = () => {
        if (allAcceptedFriends.length == 0) { // No accepted friends, show empty state screen
            return (
                <View>
                    <Text style={{
                        margin: 5, fontSize: 14, color: 'grey', textAlign: "center",
                        fontFamily: 'serif'
                    }}>
                        No friends yet, your added friends will appear here
                    </Text>
                </View>
            )
        }
        return (
            <SectionList
                progressViewOffset={100}
                sections={[
                    { title: "", data: allAcceptedFriends },
                ]}
                renderItem={({ item }) => renderFriends(item[0], item[1])} // Each item is [userDetails, UserID]
                keyExtractor={(item, index) => index}
            />
        )
    }

    return (
        <View style={styles.container}>
            <Overlay
                isVisible={overlayVisible}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                overlayBackgroundColor="red"
                width="auto"
                height="auto"
                overlayStyle={{ width: '90%', height: '80%' }}
            >
                <AllSuggestedFriendsModal friends={allSuggestedFriends} closeOverlay={closeOverlay} />
            </Overlay>

            <View style={styles.header}>
                <LinearGradient
                    colors={['#D69750', '#D5461E']}
                    start={[0.1, 0.1]}
                    end={[0.9, 0.9]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 200,
                    }}
                />
                <View style>
                    <Text style={styles.headerText}>My Friends</Text>
                </View>

                <TouchableOpacity style={styles.headerButton}
                    onPress={() => setModalVisible(true)}>
                    <MaterialCommunityIcons name="account-plus" color={'white'} size={20} />
                    {noOfFriendRequests == 0 ? null :
                        <Badge value={noOfFriendRequests.toString()} status="primary" containerStyle={{ position: "absolute", top: -4, right: -4 }} />
                    }
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <SuggestedFriends friends={suggestedFriends} seeMore={openOverlay} fullView={false} />
            </View>

            <View style={styles.body}>
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                    }}>
                    <FriendRequestModal onClose={closeModal} />
                </Modal>
                {renderAllAcceptedFriends()}
            </View>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
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
        flexDirection: "column",
        justifyContent: 'space-around',
    },
    sectionHeader: {
        borderWidth: 0.1,
        marginTop: 20,
        margin: 5,
        elevation: 5,
        backgroundColor: '#f0f0f0',
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '10%',
        fontFamily: 'serif',
        alignSelf: 'center',
        color: 'white'

    },
    headerButton: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'flex-end',
        paddingRight: 10,
        paddingLeft: 10,
        paddingBottom: 20,
        paddingTop: 20,
        marginBottom: 10,
        marginRight: '5%',
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
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: '5%',
        marginRight: '10%',
        paddingBottom: '2%',
        paddingTop: '2%',
        marginTop: 10,
        borderRadius: 8,

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
});