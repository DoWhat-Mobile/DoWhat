import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ActivityIndicator, Modal
} from "react-native";
import { useFocusEffect } from '@react-navigation/native'
import firebase from '../../database/firebase';
import ListOfPlans from './ListOfPlans';
import { connect } from 'react-redux';
import RouteFilterModal from './RouteFilterModal';

/**
 * Parent component holding all the plans, and modal to start planning a new timeline 
 */
const AllPlans = ({ navigation, userID, route }) => {
    useFocusEffect(
        useCallback(() => {
            var isAddingFavouriteToNewPlan = route.params == undefined
                ? false : route.params.addingFavouriteToNewPlan;
            if (isAddingFavouriteToNewPlan) setModalVisibility(true)
            getUpcomingCollaborationsFromFirebase();
            return () => firebase.database().ref().off();
        }, [])
    )

    const [allBoards, setAllBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisibility, setModalVisibility] = useState(false);

    const getUpcomingCollaborationsFromFirebase = async () => {
        firebase.database().ref()
            .on('value', snapshot => {
                const database = snapshot.val();
                const allUsers = database.users;
                if (allUsers[userID].hasOwnProperty('collab_boards')) {
                    const allCollaborations = allUsers[userID].collab_boards;
                    var newBoardState = [];
                    for (var board in allCollaborations) {
                        const boardID = board;
                        var collabBoard = database.collab_boards[boardID];
                        if (isBoardOutdated(boardID)) {
                            removeFromFirebase(collabBoard, boardID)
                            continue;
                        }

                        collabBoard.boardID = boardID; // Attach board ID to props of board 
                        collabBoard.isUserHost = boardID.substring(0, boardID.indexOf("_")) == userID;
                        newBoardState.push(collabBoard);
                        setAllBoards([...allBoards, collabBoard]);
                    }
                    setAllBoards([...newBoardState]);
                } else {
                    setAllBoards([]); // If no collab boards node under user
                }
                setIsLoading(false)
            })
    }

    // Clean data from Firebase if the board is outdated
    const removeFromFirebase = async (board, boardID) => {
        var updates = {}
        updates['/collab_boards/' + boardID] = null;

        // Add all the invitees to the updates(deletes) to be made
        for (var firebaseID in board.invitees) {
            const inviteeID = firebaseID;
            updates['/users/' + inviteeID + '/collab_boards/' + boardID] = null;
        }

        // Delete collab board, as well as the invitations on each user's Firebase node
        firebase.database().ref()
            .update(updates);
    }

    const isBoardOutdated = (boardID) => {
        var currDate = new Date();
        const yesterday = currDate.setDate(currDate.getDate() - 1)
        const boardDate = new Date(boardID.substring(boardID.indexOf('_') + 1));
        return boardDate.getTime() <= yesterday;
    }

    const renderAppropriateScreen = () => {
        var isAddingFavourite = route.params == undefined
            ? false : route.params.addingFavourite; // Undefined if come from Feed using bottom tab nav


        // console.log("Route parameters: ", route.params)

        if (allBoards.length == 0) { // Empty state
            return (
                <View style={styles.container}>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisibility}
                        onRequestClose={() => {
                            closeModal()
                        }}>
                        <View style={styles.modalContainer}>
                            <RouteFilterModal onClose={closeModal} navigation={navigation} />
                        </View>
                    </Modal>
                    <View style={{ flex: 5, justifyContent: 'center', }}>
                        <Image
                            style={styles.image}
                            source={require("../../assets/clueless.png")}
                        />
                    </View>
                    <View style={{ flex: 1, }}>
                        <Text style={{
                            fontSize: 20, fontWeight: 'bold', textAlign: "center",
                            fontFamily: 'serif'
                        }}>
                            No plans yet
                        </Text>
                        <Text style={{
                            margin: 5, fontSize: 14, color: 'grey', textAlign: "center",
                            fontFamily: 'serif'
                        }}>
                            Add some friends in DoWhat and plan with them! Your plans with your DoWhat friends will appear here.
                        </Text>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.planForMe} onPress={() => setModalVisibility(true)}>
                            <Text style={styles.buttonText}>Plan my first activity</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        return (
            <View style={[styles.container,
            isAddingFavourite ? { backgroundColor: 'grey' } : {}]}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisibility}
                    onRequestClose={() => {
                        closeModal()
                    }}>
                    <View style={styles.modalContainer}>
                        <RouteFilterModal onClose={closeModal} navigation={navigation} />
                    </View>
                </Modal>
                <View style={styles.header}>
                    <Text style={styles.headerText}> Upcoming Plans</Text>
                </View>
                <View style={styles.body}>
                    <ListOfPlans plans={allBoards} refreshList={getUpcomingCollaborationsFromFirebase}
                        navigation={navigation} userID={userID} addingFavourite={isAddingFavourite}
                        event={isAddingFavourite ? route.params.event : null} />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.planForMe}
                        disabled={isAddingFavourite}
                        onPress={() => setModalVisibility(true)}>
                        <Text style={[styles.buttonText,
                        isAddingFavourite
                            ? { backgroundColor: '#72706E', color: '#ABAAAA' } // Disabled button visual
                            : {}]}>
                            Plan activities for me
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const closeModal = () => {
        setModalVisibility(false);
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    }

    return (
        renderAppropriateScreen()
    );
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID
    };
};

export default connect(mapStateToProps, null)(AllPlans);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    header: {
        flex: 1,
        justifyContent: 'center',

    },
    headerText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'serif'

    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    image: {
        width: '100%',
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
        marginLeft: "5%",
        marginRight: "5%",
        marginTop: "8%"
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: "center",
        borderRadius: 5,
        backgroundColor: "#cc5327",
        color: "#fcf5f2",
        fontFamily: 'serif'
    },
    footer: {
        flex: 1,
    },
});