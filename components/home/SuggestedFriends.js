import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import firebase from '../../database/firebase';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';

/**
 * SuggestedFriends is used in two components, as a child of Friends, and as a child of
 * AllSuggestedFriendsModal. AllSuggestedFriends renders all friends, while this comonent
 * in Friends only renders the first 4 suggested friends. 
 * The toggling is controlled by the boolean flag "fullView" props 
 */
const SuggestedFriends = ({ friends, seeMore, fullView, currUserName, userID }) => {
    useEffect(() => {
        setAllFriends(friends);
    }, [])

    const [allFriends, setAllFriends] = useState(friends)

    const handleAddFriend = (push_token, firebaseUID) => {
        sendFriendRequest(firebaseUID);
        sendPushNotification(push_token);
        markAsRequested(firebaseUID);
    }

    const sendFriendRequest = async (firebaseUID) => {
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

    // API call format
    const sendPushNotification = async (push_token) => {
        const message = {
            to: push_token, // from user's Firebase node 
            sound: 'default',
            title: 'Friend Request',
            body: currUserName.replace('_', ' ') + ' wants to add you as a friend on DoWhat!',
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

    // Update component state
    const markAsRequested = (friendID) => {
        const currFriends = [...allFriends];
        // Find the friend from all friends in component state
        for (var i = 0; i < allFriends.length; i++) {
            if (allFriends[i][1] == friendID) {
                currFriends[i][2] = true; //Mark as requested 
            }
        }
        setAllFriends([...currFriends]);
    }

    const renderIndividualFriendsButton = (friendRequestAlreadySent,
        push_token, friendFirebaseUID) => {
        if (friendRequestAlreadySent) {
            return (
                <TouchableOpacity disabled={true}
                    style={[styles.addFriendButton, { backgroundColor: '#1a936f' }]}>
                    <Text style={{
                        fontWeight: 'bold', fontSize: 12, textAlign: 'center',
                        color: '#f0f0f0'
                    }}>
                        Friend request sent
                </Text>
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity
                onPress={() => handleAddFriend(push_token, friendFirebaseUID)}
                style={styles.addFriendButton}>
                <Text style={{
                    fontWeight: 'bold', fontSize: 12, textAlign: 'center',
                    color: '#1d3557'
                }}>
                    Add friend
                </Text>
            </TouchableOpacity>
        )

    }

    // Style of the individual cards
    const renderIndividualFriends = (friend) => {
        const friendName = friend[0].first_name + ' ' + friend[0].last_name;
        const friendRequestAlreadySent = friend[2];
        const push_token = friend[0].push_token;
        const friendFirebaseUID = friend[1];
        return (
            <View style={styles.friendCard}>
                <View style={{
                    borderTopWidth: 40, position: 'absolute', borderTopColor: '#b7b7a4',
                    alignSelf: 'stretch'
                }}>
                    <Text>             {/*This spacing is for styling*/}                       </Text>
                </View>
                <View style={{
                    flex: 1, width: '100%', alignItems: 'center',
                    justifyContent: 'center', borderTopColor: 'grey',
                }}>
                    <Image
                        source={{ uri: friend[0].profile_picture_url }}
                        style={{ height: 50, width: 50, borderRadius: 100 }}
                    />
                </View>
                <View style={{ flex: 1, }}>
                    <Text style={styles.nameStyle}>
                        {friendName}
                    </Text>
                </View>
                {renderIndividualFriendsButton(friendRequestAlreadySent,
                    push_token, friendFirebaseUID)}
            </View>
        )
    }

    return (
        <View>
            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                <Text style={{ color: 'black', marginLeft: 5, fontFamily: 'serif', }}>
                    {fullView ? 'All ' : ''}Suggested Friends
                </Text>
                <TouchableOpacity onPress={seeMore}>
                    <Text style={{ color: '#6c757d', marginRight: 5, fontFamily: 'serif' }}>
                        {fullView ? 'Close' : 'See all'}
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={allFriends}
                horizontal={false}
                numColumns={4}
                renderItem={({ item }) => (
                    renderIndividualFriends(item)
                )}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    )
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName
    };
};

export default connect(mapStateToProps, null)(SuggestedFriends);

const styles = StyleSheet.create({
    friendCard: {
        borderWidth: 0.5,
        margin: 2,
        flexShrink: 1,
        borderRadius: 5,
        height: 150,
        width: 120,
    },
    nameStyle: {
        flexWrap: 'wrap',
        textAlign: 'center',

    },
    addFriendButton: {
        borderWidth: 0.5,
        margin: 5,
        marginTop: 0,
        borderColor: '#1d3557'
    }
});