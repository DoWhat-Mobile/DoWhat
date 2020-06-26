import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Dimensions } from "react-native";
import { Card } from 'react-native-elements';
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
                        const boardID = allCollaborations[board];
                        var collabBoard = database.collab_boards[boardID];
                        collabBoard.boardID = boardID; // Attach board ID to props of board 
                        newBoardState.push(collabBoard);
                        setAllBoards([...allBoards, collabBoard]);
                    }
                    setAllBoards([...newBoardState]);
                }
            })
    }

    // console.log(allBoards);

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