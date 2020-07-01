import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from "react-native";
import firebase from '../../database/firebase';
import ListOfPlans from './ListOfPlans';
import { connect } from 'react-redux';
import { formatDateToString } from '../../reusable-functions/GoogleCalendarGetBusyPeriods';

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
                <Button title="Plan activities for me" onPress={() => navigation.navigate("DateSelection")} />
            </View>

        </View >
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
    footer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
});