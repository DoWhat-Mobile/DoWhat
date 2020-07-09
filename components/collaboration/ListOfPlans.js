import React, { useState } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Text, TouchableOpacity, SectionList, Modal } from 'react-native';
import IndividualPlanModal from './IndividualPlanModal';
import ChatRoomModal from './ChatRoomModal';
import firebase from '../../database/firebase';
import { findOverlappingIntervals } from '../../reusable-functions/OverlappingIntervals';
import { Overlay } from 'react-native-elements';
import { genreEventObjectArray } from '../../reusable-functions/data_timeline';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDate } from '../DateSelection';

/**
 * The <SectionList> Component within the AllPlans component. This is the component
 * which shows all the plans that the user is part of.
 */
const ListOfPlans = ({ plans, navigation, userID, allEvents }) => {
    const [boardModalVisibility, setBoardModalVisibility] = useState(false);
    const [boardDetails, setBoardDetails] = useState({})
    const [boardChatRoomVisibility, setBoardChatRoomVisibility] = useState(false);

    const closeModal = () => {
        setBoardModalVisibility(false);
    }

    const closeChatModal = () => {
        setBoardChatRoomVisibility(false);
    }

    // To open each individual collaboration board modal
    const viewMoreDetails = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setBoardModalVisibility(true)

        // Once board is opened, its no longer considered a new board
        firebase.database()
            .ref('collab_boards/' + board.boardID)
            .update({ isNewlyAddedBoard: false });
    }

    // To open each individual collaboration board ChatRoom 
    const viewBoardChatRoom = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setBoardChatRoomVisibility(true)
    }

    /**
     * @param {*} topNumber is the limit of how many categories we want 
     */
    const getTopVoted = (category, topNumber) => {
        var sortable = []; //2D Array to be used for sorting by ratings
        var count = 0;

        for (var prop in category) {
            sortable.push([prop, category[prop]])
            count++;
        }
        // Votes stored in index '1' of each inner array 
        sortable.sort((x, y) => {
            return y[1] - x[1];
        })

        var final = []
        for (var i = 0; i < topNumber; i++) {
            final.push(sortable[i][0]); // Get the names only
        }
        return final;
    }

    const handleRouteToFinalized = (board) => {
        firebase.database()
            .ref('collab_boards/' + board.boardID)
            .once('value')
            .then((snapshot) => {
                const currBoard = snapshot.val();
                const finalizedTimeline = board.finalized_timeline;
                goToFinalized(currBoard, finalizedTimeline, board)

            })
    }

    const goToFinalized = (boardFromFirebase, finalizedTimeline, boardFromParent) => {
        const accessRights = boardFromParent.isUserHost ? 'host' : 'attendee';

        const topGenres = getTopVoted(boardFromFirebase.preferences, 3);
        const topCuisines = getTopVoted(boardFromFirebase.food_filters.cuisine, 3);
        const topArea = getTopVoted(boardFromFirebase.food_filters.area, 2);
        const topPrice = getTopVoted(boardFromFirebase.food_filters.price, 1)[0];
        const timeInterval = findOverlappingIntervals(boardFromFirebase.availabilities, undefined);
        const myFilters = {
            area: topArea,
            cuisine: topCuisines,
            price: topPrice
        };

        var navigationProps = {
            route: "boardFromFirebase",
            genres: topGenres,
            timeInterval: timeInterval,
            filters: myFilters,
            board: boardFromFirebase, // for Gcal Invite 
            currentEvents: finalizedTimeline,
            access: accessRights// 'host' | 'invitee' 
            //userLocation: 

        }
        console.log("navigation props: ", navigationProps.access);
        navigation.navigate("Loading", navigationProps);
    }

    // Fraction of invitees that have finalized their collaboration inputs
    const getFinalizedFraction = (board) => {
        var noOfRejectees = 0;
        if (board.hasOwnProperty('rejected')) {
            noOfRejectees = Object.keys(board.rejected).length;
        }

        if (board.hasOwnProperty('finalized')) {
            const total = Object.keys(board.invitees).length + noOfRejectees;
            const confirmed = Object.keys(board.finalized).length;
            return confirmed / total;
        } else {
            return 0;
        }
    }

    // So that all users of collaboration board gets the same finalized timeline
    const storeFinalizedTimelineInFirebase = (finalized, board) => {
        var updates = {}
        updates['finalized_timeline'] = finalized;

        // Only get finalized timeline ONCE, if timeline alr exists, dont update
        if (board.hasOwnProperty('finalized_timeline')) {
            return;
        }

        firebase.database().
            ref('collab_boards/' + board.boardID)
            .update(updates);
    }

    // Generate finalized timeline only when all invitees have responded, finalizedFraction == 1
    const generateFinalizedTimeline = (board, isBoardFinalized) => {
        if (!isBoardFinalized) return;

        const topGenres = getTopVoted(board.preferences, 3);
        const topCuisines = getTopVoted(board.food_filters.cuisine, 3);
        const topArea = getTopVoted(board.food_filters.area, 2);
        const topPrice = getTopVoted(board.food_filters.price, 1)[0];
        const myFilters = {
            area: topArea,
            cuisine: topCuisines,
            price: topPrice
        };

        const finalized = genreEventObjectArray(topGenres, allEvents, myFilters) // Finalized timeline
        storeFinalizedTimelineInFirebase(finalized, board);
    }

    const renderCollaborationBoard = (board) => {
        const isBoardFinalized = getFinalizedFraction(board) == 1;
        const selectedDate = new Date(board.selected_date);
        const formattedDate = formatDate(selectedDate.getDay(),
            selectedDate.getMonth(), selectedDate.getDate());

        const boardTitleString = () => {
            return isBoardFinalized
                ? 'Timeline generated'
                : board.isNewlyAddedBoard
                    ? 'Newly added board'
                    : 'Collaboration in progress';
        }

        const boardSubTitleString = () => {
            return isBoardFinalized
                ? 'Your schedule is ready to view!'
                : board.isNewlyAddedBoard
                    ? 'Check me out!'
                    : 'Wait for all your friends to finalize their input!';
        }

        const cardColorStyle = () => {
            return isBoardFinalized
                ? { backgroundColor: '#eddcd2' }
                : board.isNewlyAddedBoard
                    ? { backgroundColor: 'white', borderColor: '#eddcd2', borderWidth: 4, elevation: 1 }
                    : { backgroundColor: 'white' };
        }

        generateFinalizedTimeline(board, isBoardFinalized)
        return (
            <TouchableOpacity onPress={() => isBoardFinalized
                ? handleRouteToFinalized(board)
                : viewMoreDetails(board)}>
                <View style={[styles.individualPlan, cardColorStyle()]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={styles.sectionSubHeaderText}>
                                {formattedDate}
                            </Text>
                        </View>
                        <Text style={styles.sectionSubHeaderText}>
                            By {board.isUserHost ? 'Me' : board.host.replace(/_/g, ' ')}
                        </Text>
                    </View>

                    <Text style={styles.sectionHeaderText}>
                        {boardTitleString()}
                    </Text>
                    <Text style={styles.sectionSubHeaderText}>
                        {boardSubTitleString()}
                    </Text>

                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: '12%' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 }}>
                            <Text style={{
                                fontSize: 11,
                                borderWidth: 0.2, padding: 2, backgroundColor: '#E86830',
                                borderColor: 'grey', borderRadius: 5, textAlign: 'center',
                                paddingLeft: 5, paddingRight: 5, color: '#FEFBFA', marginBottom: 15
                            }}>
                                {Object.keys(board.finalized).length}/
                                {Object.keys(board.invitees).length +
                                    (board.hasOwnProperty('rejected')
                                        ? Object.keys(board.rejected).length : 0)}
                            </Text>
                            <Text style={[styles.sectionSubHeaderText, { color: '#554E4E' }]}>  responded</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => viewBoardChatRoom(board)}>
                                <MaterialCommunityIcons name="chat" color={'black'} size={25} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={[styles.container]}>
            <Overlay
                isVisible={boardModalVisibility}
                windowBackgroundColor="rgba(255, 255, 255, .5)"
                width="auto"
                height="auto"
                overlayStyle={{ width: '95%', height: '95%', borderRadius: 20, }}
            >
                <IndividualPlanModal onClose={closeModal} board={boardDetails} />
            </Overlay>

            <Modal
                animationType="fade"
                transparent={false}
                visible={boardChatRoomVisibility}
                onRequestClose={() => {
                    closeChatModal()
                }}>
                <ChatRoomModal onClose={closeChatModal} board={boardDetails} />
            </Modal>

            <SectionList
                progressViewOffset={100}
                sections={[
                    { title: "", data: plans },
                ]}
                renderItem={({ item }) => renderCollaborationBoard(item)}
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

const mapStateToProps = (state) => {
    return {
        allEvents: state.add_events.events,
    };
};

export default connect(mapStateToProps, null)(ListOfPlans);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    individualPlan: {
        borderWidth: 0.1,
        borderRadius: 10,
        start: '10%',
        width: '80%',
        height: 150,
        padding: 10,
        marginTop: 10,
        paddingBottom: 5,
    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    sectionHeaderText: {
        fontFamily: 'serif',
        color: '#4f4f4f',
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 15,
    },
    sectionSubHeaderText: {
        fontSize: 12, color: '#A4A4A6', fontWeight: '100'
    },
    icon: {
        borderWidth: 1,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 50,

    },
    footer: {
        flex: 1,
    },
})