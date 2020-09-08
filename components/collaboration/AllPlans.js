import React, { useCallback, useState, useEffect } from "react";
import {
    View,
    StatusBar,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import firebase from "../../database/firebase";
import ListOfPlans from "./ListOfPlans";
import { setAddingFavourites } from "../../actions/favourite_event_actions";
import { connect } from "react-redux";
import RouteFilterModal from "./RouteFilterModal";
import { COLORS } from "../../assets/colors";
import { Feather } from "@expo/vector-icons";

/**
 * Parent component holding all the plans, and modal to start planning a new timeline
 */
const AllPlans = ({
    navigation,
    userID,
    route,
    isAddingFavouriteToNewPlan,
    setAddingFavourites,
    favouriteEvents,
    isAddingFavouritesToExistingBoard,
    userProfilePicture,
}) => {
    useFocusEffect(
        useCallback(() => {
            getUpcomingCollaborationsFromFirebase();
            return () => firebase.database().ref().off();
        }, [])
    );
    useEffect(() => {
        if (isAddingFavouriteToNewPlan) {
            setModalVisibility(true);
            setAddingFavourites(false);
        }
    }, [isAddingFavouriteToNewPlan]);

    const [allBoards, setAllBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisibility, setModalVisibility] = useState(false);

    const getUpcomingCollaborationsFromFirebase = async () => {
        firebase
            .database()
            .ref()
            .on("value", (snapshot) => {
                const database = snapshot.val();
                const allUsers = database.users;
                if (allUsers[userID].hasOwnProperty("collab_boards")) {
                    const allCollaborations = allUsers[userID].collab_boards;
                    var newBoardState = [];
                    for (var board in allCollaborations) {
                        const boardID = board;
                        var collabBoard = database.collab_boards[boardID];
                        if (isBoardOutdated(boardID)) {
                            removeFromFirebase(collabBoard, boardID);
                            continue;
                        }

                        collabBoard.boardID = boardID; // Attach board ID to props of board
                        collabBoard.isUserHost =
                            boardID.substring(0, boardID.indexOf("_")) ==
                            userID;
                        newBoardState.push(collabBoard);
                        setAllBoards([...allBoards, collabBoard]);
                    }
                    setAllBoards([...newBoardState]);
                } else {
                    setAllBoards([]); // If no collab boards node under user
                }
                setIsLoading(false);
            });
    };

    // Clean data from Firebase if the board is outdated
    const removeFromFirebase = async (board, boardID) => {
        var updates = {};
        updates["/collab_boards/" + boardID] = null;

        // Add all the invitees to the updates(deletes) to be made
        for (var firebaseID in board.invitees) {
            const inviteeID = firebaseID;
            updates["/users/" + inviteeID + "/collab_boards/" + boardID] = null;
        }

        // Delete collab board, as well as the invitations on each user's Firebase node
        firebase.database().ref().update(updates);
    };

    const isBoardOutdated = (boardID) => {
        var currDate = new Date();
        const yesterday = currDate.setDate(currDate.getDate() - 1);
        const boardDate = new Date(boardID.substring(boardID.indexOf("_") + 1));
        return boardDate.getTime() <= yesterday;
    };

    const ListHeaderComponent = () => {
        return (
            <View style={styles.header}>
                <Image
                    style={{
                        borderRadius: 100,
                        height: 30,
                        width: 30,
                        borderWidth: 1,
                        borderColor: "white",
                        marginLeft: 16,
                    }}
                    source={{
                        uri: userProfilePicture,
                    }}
                />
                <Text style={styles.headerText}>Upcoming Plans</Text>

                <TouchableOpacity
                    onPress={() => alert("Upcoming functionality")}
                    style={{
                        color: "white",
                        textDecorationLine: "underline",
                        marginTop: 4,
                        marginRight: 16,
                    }}
                >
                    <Feather name="more-horizontal" size={24} color="white" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderAppropriateScreen = () => {
        var isAddingFavourite =
            route.params == undefined ? false : route.params.addingFavourite; // Undefined if come from Feed using bottom tab nav

        // console.log("Route parameters: ", route.params)

        if (allBoards.length == 0) {
            // Empty state
            return (
                <View style={styles.container}>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisibility}
                        onRequestClose={() => {
                            closeModal();
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <RouteFilterModal
                                onClose={closeModal}
                                navigation={navigation}
                            />
                        </View>
                    </Modal>
                    <View style={{ flex: 1 }}>
                        <ListHeaderComponent />
                    </View>

                    <View style={{ flex: 9 }}>
                        <View style={{ flex: 5, justifyContent: "center" }}>
                            <Image
                                style={styles.image}
                                source={require("../../assets/clueless.png")}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    textAlign: "center",
                                }}
                            >
                                No plans yet
                            </Text>
                            <Text
                                style={{
                                    margin: 5,
                                    fontSize: 14,
                                    color: "grey",
                                    textAlign: "center",
                                    marginHorizontal: "5%",
                                }}
                            >
                                Add some friends in DoWhat and plan with them!
                                Your plans with your DoWhat friends will appear
                                here.
                            </Text>
                        </View>
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.planForMe}
                                onPress={() => setModalVisibility(true)}
                            >
                                <Text style={styles.buttonText}>
                                    Plan my first activity
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View
                style={[
                    styles.container,
                    isAddingFavouritesToExistingBoard
                        ? { backgroundColor: "grey" }
                        : {},
                ]}
            >
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisibility}
                    onRequestClose={() => {
                        closeModal();
                    }}
                >
                    <View style={styles.modalContainer}>
                        <RouteFilterModal
                            onClose={closeModal}
                            navigation={navigation}
                        />
                    </View>
                </Modal>
                <View style={{ flex: 1 }}>
                    <ListHeaderComponent />
                </View>

                <View style={styles.body}>
                    <ListOfPlans
                        plans={allBoards}
                        refreshList={getUpcomingCollaborationsFromFirebase}
                        navigation={navigation}
                        userID={userID}
                        addingFavourite={isAddingFavouritesToExistingBoard}
                        event={
                            isAddingFavouritesToExistingBoard
                                ? favouriteEvents
                                : null
                        }
                    />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.planForMe}
                        disabled={isAddingFavourite}
                        onPress={() => setModalVisibility(true)}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                isAddingFavourite
                                    ? {
                                          backgroundColor: "#72706E",
                                          color: "#ABAAAA",
                                      } // Disabled button visual
                                    : {},
                            ]}
                        >
                            Plan activities for me
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const closeModal = () => {
        setModalVisibility(false);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return renderAppropriateScreen();
};

const mapDispatchToProps = {
    setAddingFavourites,
};

const mapStateToProps = (state) => {
    // console.log("All added events: ",
    //     state.favourite_events)
    return {
        userID: state.add_events.userID,
        isAddingFavouriteToNewPlan: state.favourite_events.isAddingFavourites,
        isAddingFavouritesToExistingBoard:
            state.favourite_events.isAddingFavouritesToExistingBoard,
        favouriteEvents: state.favourite_events.favouriteEvents, // 2D array
        userProfilePicture: state.add_events.profilePicture,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AllPlans);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    header: {
        flex: 1,
        elevation: 1,
        paddingTop: StatusBar.currentHeight,
        paddingBottom: "10%",
        flexDirection: "row",
        backgroundColor: COLORS.orange,
        justifyContent: "space-between",
    },
    headerText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    body: {
        flex: 9,
        justifyContent: "center",
        marginTop: 46,
    },
    image: {
        width: "100%",
        borderTopWidth: 30,
        borderRadius: 15,
        borderWidth: 0.2,
        borderColor: "#f0f0f0",
        height: "90%",
    },
    planForMe: {
        flex: 1,
        flexDirection: "column",
        alignSelf: "stretch",
        alignContent: "stretch",
        marginHorizontal: "5%",
        marginTop: "8%",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        borderRadius: 5,
        backgroundColor: COLORS.orange,
        color: "#fcf5f2",
        padding: "1%",
    },
    footer: {
        flex: 1,
    },
});
