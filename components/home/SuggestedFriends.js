import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import firebase from "../../database/firebase";
import {
    View,
    StyleSheet,
    FlatList,
    Text,
    Image,
    TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../../assets/colors";

/**
 * SuggestedFriends is used in two components, as a child of Friends, and as a child of
 * AllSuggestedFriendsModal. AllSuggestedFriends renders all friends, while this comonent
 * in Friends only renders the first 4 suggested friends.
 * The toggling is controlled by the boolean flag "fullView" props
 */
const SuggestedFriends = ({
    friends,
    seeMore,
    fullView,
    currUserName,
    userID,
    currUserProfilePicture,
}) => {
    useEffect(() => {
        setAllFriends(friends);
    }, []);

    const [allFriends, setAllFriends] = useState(friends);

    const handleAddFriend = (push_token, firebaseUID) => {
        sendFriendRequest(firebaseUID);
        sendPushNotification(push_token);
        markAsRequested(firebaseUID);
    };

    const sendFriendRequest = async (firebaseUID) => {
        const requestSender = userID; // Current app userID from Redux State
        const status = {};
        status[currUserName] = {
            firebase_id: requestSender,
            picture_url: currUserProfilePicture,
        };
        try {
            firebase
                .database()
                .ref("users/" + firebaseUID) // This is the friend that we are adding's UID
                .child("friends")
                .child("requests")
                .update(status);
        } catch (err) {
            console.log("Error adding friend to Firebase, ", err);
        }
    };

    // API call format
    const sendPushNotification = async (push_token) => {
        const message = {
            to: push_token, // from user's Firebase node
            sound: "default",
            title: "Friend Request",
            body:
                currUserName.replace("_", " ") +
                " wants to add you as a friend on DoWhat!",
            data: { data: "goes here" },
            _displayInForeground: true,
        };
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
    };

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
    };

    const renderIndividualFriendsButton = (
        friendRequestAlreadySent,
        push_token,
        friendFirebaseUID
    ) => {
        if (friendRequestAlreadySent) {
            return (
                <TouchableOpacity style={{ marginRight: 10 }} disabled={true}>
                    <FontAwesome
                        name="hourglass-half"
                        size={24}
                        color={COLORS.orange}
                    />
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                onPress={() => handleAddFriend(push_token, friendFirebaseUID)}
                style={{ marginRight: 10 }}
            >
                <FontAwesome
                    name="plus-circle"
                    size={24}
                    color={COLORS.orange}
                />
            </TouchableOpacity>
        );
    };

    // Style of the individual cards
    const renderIndividualFriends = (friend) => {
        const friendName = friend[0].first_name + " " + friend[0].last_name;
        const friendRequestAlreadySent = friend[2];
        const push_token = friend[0].push_token;
        const friendFirebaseUID = friend[1];
        return (
            <View>
                <View style={styles.friendCard}>
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Image
                            source={{ uri: friend[0].profile_picture_url }}
                            style={{
                                height: 50,
                                width: 50,
                                borderRadius: 100,
                                marginRight: 20,
                            }}
                        />

                        <Text style={styles.nameStyle}>{friendName}</Text>
                    </View>
                    {renderIndividualFriendsButton(
                        friendRequestAlreadySent,
                        push_token,
                        friendFirebaseUID
                    )}
                </View>
                <View
                    style={{
                        marginTop: 15,
                        marginLeft: 70,
                        borderBottomColor: "#d9d9d9",
                        borderBottomWidth: 1,
                    }}
                />
            </View>
        );
    };

    return (
        <View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        color: "black",
                        marginLeft: 10,
                        fontWeight: "bold",
                        fontSize: 20,
                    }}
                >
                    {fullView ? "All " : ""}Suggested Friends
                </Text>
                <TouchableOpacity onPress={seeMore}>
                    <Text style={{ color: "#6c757d", marginRight: 5 }}>
                        {fullView ? "Close" : "See all"}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 10 }}>
                <FlatList
                    data={allFriends.slice(0, 2)}
                    renderItem={({ item, index }) =>
                        renderIndividualFriends(item)
                    }
                    keyExtractor={(item, index) => item + index}
                />
            </View>
        </View>
    );
};

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName,
        currUserProfilePicture: state.add_events.profilePicture,
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
        width: "35%",
    },
    nameStyle: {
        flexWrap: "wrap",
        textAlign: "center",
        fontSize: 16,
    },
    addFriendButton: {
        borderWidth: 0.5,
        margin: 5,
        marginTop: 0,
        borderColor: "#1d3557",
    },
    friendCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: "2%",
        paddingTop: "2%",
        marginTop: 10,
        borderRadius: 8,
        alignItems: "center",
    },
});
