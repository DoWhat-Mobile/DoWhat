import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import firebase from '../../database/firebase';
import ListOfPlans from './ListOfPlans';
import { connect } from 'react-redux';

const AllPlans = ({ navigation, userID }) => {
    useEffect(() => {
        getUpcomingCollaborationsFromFirebase();
    }, [])

    const [allBoards, setAllBoards] = useState([]);

    const getUpcomingCollaborationsFromFirebase = async () => {
        firebase.database().ref()
            .once("value")
            .then((snapshot) => {
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
                        newBoardState.push(collabBoard);
                        setAllBoards([...allBoards, collabBoard]);
                    }
                    setAllBoards([...newBoardState]);
                }
            })
    }

    // Clean data from Firebase if the board is outdated
    const removeFromFirebase = async (board, boardID) => {
        var updates = {}
        updates['/collab_boards/' + boardID] = null;

        // Add all the invitees to the updates(deletes) to be made
        for (var name in board.invitees) {
            const inviteeID = board.invitees[name];
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
        if (allBoards.length == 0) { // Empty state
            return (
                <View style={styles.container}>
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
                            When you create plans with your DoWhat friends, they will appear here.
                        </Text>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.planForMe} onPress={() => navigation.navigate("DateSelection")}>
                            <Text style={styles.buttonText}>Plan my first activity</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}> Upcoming Plans</Text>
                </View>
                <View style={styles.body}>
                    <ListOfPlans plans={allBoards} refreshList={getUpcomingCollaborationsFromFirebase}
                        navigation={navigation} userID={userID} />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.planForMe} onPress={() => navigation.navigate("DateSelection")}>
                        <Text style={styles.buttonText}>Plan activities for me</Text>
                    </TouchableOpacity>
                </View>
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
    header: {
        flex: 1,
        justifyContent: 'center',

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
        borderWidth: 0.2,
        textAlign: "center",
        borderRadius: 10,
        backgroundColor: "#cc5327",
        color: "#fcf5f2",
    },
    footer: {
        flex: 1,
    },
});