import React, { useState } from 'react';
import { Button, View, StyleSheet, Text, TouchableOpacity, SectionList, Dimensions, Modal } from 'react-native';
import IndividualPlanModal from './IndividualPlanModal';
import { AntDesign } from "@expo/vector-icons";
import * as Progress from 'react-native-progress';
import { findOverlappingIntervals } from '../../reusable-functions/OverlappingIntervals';

/**
 * The <SectionList> Component within the AllPlans component. This is the component
 * which shows all the plans that the user is part of.
 */
const ListOfPlans = ({ plans, refreshList, navigation, userID }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisibility, setModalVisibility] = useState(false);
    const [boardDetails, setBoardDetails] = useState({})

    // Not functional yet
    const refreshPage = () => {
        setIsRefreshing(true);
        refreshList();
        setIsRefreshing(false);
    }

    // To open each individual collaboration board modal
    const viewMoreDetails = (board) => {
        setBoardDetails(board); // Pass in the details of the clicked board to the modal
        setModalVisibility(true)

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

    const goToFinalized = (board) => {
        const topGenres = getTopVoted(board.preferences, 3);
        const topCuisines = getTopVoted(board.food_filters.cuisine, 3);
        const topArea = getTopVoted(board.food_filters.area, 2);
        const topPrice = getTopVoted(board.food_filters.price, 1)[0];
        const timeInterval = findOverlappingIntervals(board.availabilities, undefined);
        var navigationProps = {
            route: "board",
            genres: topGenres,
            timeInterval: timeInterval,
            filters: {
                area: topArea,
                cuisine: topCuisines,
                price: topPrice
            },
            board: board// for Gcal Invite 
        }
        navigation.navigate("Finalized", navigationProps);
    }

    // Fraction of invitees that have finalized their collaboration inputs
    const getFinalizedFraction = (board) => {
        if (board.hasOwnProperty('finalized')) {
            const total = Object.keys(board.invitees).length;
            const confirmed = Object.keys(board.finalized).length;
            return confirmed / total;
        } else {
            return 0;
        }
    }

    const collborationBoardText = (board, isUserHost) => {
        if (isUserHost) {
            return (
                <Text>
                    Initiated by me
                </Text>
            )
        }
        return (
            <Text>
                Invited by: {board.host.replace("_", " ")}
            </Text>
        )
    }

    const renderCollaborationBoard = (board) => {
        const finalizedFraction = getFinalizedFraction(board);
        const isUserHost = board.boardID.
            substring(0, board.boardID.indexOf("_")) == userID;

        if (finalizedFraction == 1) { // All invitees are ready
            return (
                <View style={[styles.individualPlan, { backgroundColor: '#eddcd2' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text>
                                Outing plan on {board.selected_date} is ready!
                            </Text>
                            {collborationBoardText(board, isUserHost)}
                        </View>
                        <TouchableOpacity onPress={() => goToFinalized(board)}>
                            <AntDesign
                                name="arrowright"
                                size={30}
                                style={{ color: 'black' }}
                            />
                        </TouchableOpacity>
                    </View>
                    <Progress.Bar progress={finalizedFraction}
                        width={Dimensions.get('window').width - 40}
                        borderWidth={0} unfilledColor={'#f1faee'} color={'#457b9d'} />
                </View>
            )
        }
        return (
            <TouchableOpacity onPress={() => viewMoreDetails(board)}>
                <View style={styles.individualPlan}>
                    <Text>
                        Outing on: {board.selected_date}
                    </Text>
                    {collborationBoardText(board, isUserHost)}
                    <Progress.Bar progress={finalizedFraction}
                        width={Dimensions.get('window').width - 40}
                        borderWidth={0} unfilledColor={'#f1faee'} color={'#457b9d'} />
                </View>
            </TouchableOpacity>
        )
    }

    const closeModal = () => {
        setModalVisibility(false);
    }

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisibility}
                onRequestClose={() => {
                    closeModal()
                }}>
                <IndividualPlanModal onClose={closeModal} board={boardDetails} />
            </Modal>

            <SectionList
                onRefresh={() => refreshPage()}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "", data: plans },
                ]}
                renderItem={({ item }) => renderCollaborationBoard(item)}
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

export default ListOfPlans;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    individualPlan: {
        borderWidth: 1,
        borderRadius: 10,
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        marginTop: 10,
        paddingBottom: 5,
    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    footer: {
        flex: 1,
    },
})