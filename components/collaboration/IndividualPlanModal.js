import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { formatDate } from '../DateSelection';
import FoodPrice from './FoodPrice';
import FoodLocation from './FoodLocation';
import FoodCuisine from './FoodCuisine';
import GenrePicker from './GenrePicker';
import firebase from '../../database/firebase'
import { inputBusyPeriodFromGcal } from '../../reusable-functions/GoogleCalendarGetBusyPeriods';

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const IndividualPlanModal = ({ onClose, board, userID, currUserName }) => {
    useEffect(() => {
        extractAndSetTopGenres(board.preferences);
        extractAndSetInvitees(board.invitees);
    }, []);

    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button
    const [boardIsFinalized, setBoardIsFinalized] = useState(false);
    const [invitees, setInvitees] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [allGenres, setAllGenres] = useState([['ADVENTURE', false], ['ARTS', false],
    ['LEISURE', false], ['NATURE', false], ['NIGHTLIFE', false], ['FOOD', false]]);

    const [location, setLocation] = useState([['NORTH', false], ['EAST', false],
    ['WEST', false], ['CENTRAL', false]]);

    const [cuisine, setCuisine] = useState([['ASIAN', false], ['WESTERN', false],
    ['CHINESE', false], ['KOREAN', false], ['INDIAN', false], ['JAPANESE', false],
    ['CAFE', false], ['HAWKER', false],]);

    const [budget, setBudget] = useState(0);

    const extractAndSetTopGenres = (object) => {
        var sortable = []; // Sort genre 
        for (var genre in object) {
            sortable.push([genre, object[genre]]); // ['adventure', 2], 
        }
        sortable.sort((x, y) => y[1] - x[1]); // Sort in decreasing order of votes
        setTopGenres([...sortable]);
    }

    const extractAndSetInvitees = (object) => {
        var newState = [];
        for (var name in object) {
            newState.push(name);
        }
        setInvitees([...newState]);
    }


    const handleGenreSelect = (index) => {
        var newState = [...allGenres];
        newState[index][1] = !newState[index][1]; // Toggle between true/false
        setAllGenres([...newState]);
    }


    const handlePricePress = (price) => {
        setBudget(price);
    }

    const handleLocationSelect = (index) => {
        var newState = [...location];
        newState[index][1] = !newState[index][1]; // Toggle between true/false
        setLocation([...newState]);
    }

    const handleCuisineSelect = (index) => {
        var newState = [...cuisine];
        newState[index][1] = !newState[index][1]; // Toggle between true/false
        setCuisine([...newState]);
    }

    const renderFoodFilter = (foodIsSelected) => {
        if (foodIsSelected) {
            return (
                <View style={styles.foodFilters}>
                    <FoodLocation location={location} handleLocationSelect={handleLocationSelect} />
                    <FoodCuisine cuisine={cuisine} handleCuisineSelect={handleCuisineSelect} />
                    <FoodPrice handlePricePress={(price) => handlePricePress(price)} />
                </View>
            );
        }
    }

    // Top three genre choices from all the votes of invitees
    const renderTopGenres = (top) => {
        if (top.length == 0) { // If useEffect haven't setState of top Genre yet
            return (
                <Text style={{ marginTop: 5, marginLeft: 5 }}>
                    Top genres:
                </Text>
            )

        } else {
            const topThree = [top[0][0], top[1][0], top[2][0]]
            return (
                <Text style={{ marginTop: 5, marginLeft: 5 }}>
                    Top genres: {topThree.toString()}
                </Text>
            )
        }
    }

    const formatInvitee = (item, index) => {
        return (
            <View>
                <TouchableOpacity style={styles.genreButton} disabled={true}>
                    <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{item}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderInvitees = (invitees) => {
        for (var i = 0; i < invitees.length; i++) {
            invitees[i] = invitees[i].replace('_', ' ');
        }
        return (
            <View style={{ flex: 1, flexDirection: "row" }}>
                <Text style={{ marginTop: 5, marginLeft: 5 }}>Invitees: </Text>
                <FlatList
                    data={invitees}
                    horizontal={true}
                    renderItem={({ item, index }) => formatInvitee(item, index)}
                    keyExtractor={(item, index) => item + index} />
            </View>
        )
    }

    // Take current board state, and perform updates using user's votes
    const updateGenres = (prevState, currState) => {
        var newState = JSON.parse(JSON.stringify(prevState)); // Deep copy to not mutate component's board state
        currState.forEach(x => { // [NATURE, true/false]
            const genre = x[0].toLowerCase();
            const selected = x[1];
            if (selected) {
                newState[genre] += 1;
            }
        })
        return newState;
    }

    // Take current board state, and perform updates using user's votes
    const updateFoodFilters = (prevState, currLocationState, currCuisineState, currBudgetState) => {
        var newState = JSON.parse(JSON.stringify(prevState)); // Deep copy to not mutate component's board state
        currLocationState.forEach(x => { // [location, true/false]
            const location = x[0].toLowerCase();
            const selected = x[1];
            if (selected) {
                newState.area[location] += 1;
            }
        })
        currCuisineState.forEach(x => { // [cuisine, true/false]
            const cuisine = x[0].toLowerCase();
            const selected = x[1];
            if (selected) {
                newState.cuisine[cuisine] += 1;
            }
        })
        newState.price[currBudgetState] += 1;
        return newState;
    }

    // Finalize updates firebase with the user's inputted preference votes
    const finalizeBoard = () => {
        var updates = {}
        const updatedPreference = updateGenres(board.preferences, allGenres)
        const updatedFoodFilters = updateFoodFilters(board.food_filters, location, cuisine, budget)
        updates['preferences'] = updatedPreference;
        updates['food_filters'] = updatedFoodFilters;

        var addFinalizedUser = {};
        addFinalizedUser[currUserName] = userID;
        updates['finalized'] = addFinalizedUser;

        firebase.database()
            .ref('collab_boards/' + board.boardID)
            .update(updates)

        setBoardIsFinalized(true); // Changes style of finalize button
        onClose() // Close modal
    }

    const inputAvailabilities = () => {
        inputBusyPeriodFromGcal(userID, selectedDate, board.boardID);
        setIsButtonDisabled(true); // Prevent syncing google calendar twice

    }

    const renderInputAvailabilitiesButton = () => {
        if (isButtonDisabled) {
            return (
                <View>
                    <TouchableOpacity style={[styles.finalizeButton, { borderRadius: 20, backgroundColor: '#2a9d8f', borderWidth: 0.2 }]}
                        disabled={true}
                        onPress={() => finalizeBoard()}>
                        <AntDesign
                            name="check"
                            size={20}
                            style={{ color: 'white' }}
                        />
                        <Text style={{ color: 'white', marginLeft: 5 }}>
                            Availabilities Inputted
                            </Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <TouchableOpacity style={styles.finalizeButton} onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}>
                    <Text>Input Availabilities</Text>
                </TouchableOpacity>
            );
        }
    }

    const renderFinalizeButton = () => {
        if (boardIsFinalized) {
            return (
                <TouchableOpacity style={[styles.finalizeButton, { borderRadius: 20, backgroundColor: '#e63946', borderWidth: 0.2 }]}
                    disabled={true}
                    onPress={() => finalizeBoard()}>
                    <AntDesign
                        name="check"
                        size={20}
                        style={{ color: 'white' }}
                    />
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity style={styles.finalizeButton} onPress={() => finalizeBoard()}>
                <Text>Finalize</Text>
            </TouchableOpacity>
        );
    }

    const selectedDate = new Date(board.selected_date);

    return (
        <View style={styles.modal}>
            <Text style={styles.headerText}>
                Your Outing on {formatDate(selectedDate.getDay(),
                selectedDate.getMonth(), selectedDate.getDate())}
            </Text>
            <AntDesign name="close" size={24}
                onPress={() => onClose()}
                style={styles.close}
            />

            <View style={styles.body}>
                <View style={styles.genreSelection}>
                    <Text style={styles.genreSelectionText}>Select your moods:</Text>
                    <GenrePicker allGenres={allGenres} handleGenreSelect={handleGenreSelect} />
                </View>
                {renderFoodFilter(allGenres[5][1])}
            </View>

            <View style={styles.footer}>
                {renderTopGenres(topGenres)}
                {renderInvitees(invitees)}
            </View>

            <View style={styles.buttonGroup}>
                {renderInputAvailabilitiesButton()}
                {renderFinalizeButton()}
            </View>
        </View >
    );
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName
    };
};

export default connect(mapStateToProps, null)(IndividualPlanModal);

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginBottom: '20%',
        marginTop: '10%',
        marginLeft: '5%',
        marginRight: '5%',
        backgroundColor: "white",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
    },
    header: {
        flex: 1,
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '15%',
        marginLeft: '8%',
        fontFamily: 'serif'
    },
    body: {
        flex: 4,
        margin: 10,
    },
    genreSelection: {
    },
    genreButton: {
        borderWidth: 0.5,
        padding: 3,
        borderRadius: 5,
        margin: 5,
    },
    genreSelectionText: {
        fontFamily: 'serif',
        marginLeft: 5,
        fontSize: 15,
        fontWeight: '800'
    },
    foodFilters: {
    },
    footer: {
        flex: 1,
        margin: 10,
        marginTop: 0,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    finalizeButton: {
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
    },
    close: {
        position: "absolute",
        left: 330,
        right: 0,
        top: 25,
        bottom: 0,
    },
});