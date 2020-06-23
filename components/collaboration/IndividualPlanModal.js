import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { formatDate } from '../DateSelection';
import FoodPrice from './FoodPrice';
import FoodLocation from './FoodLocation';
import FoodCuisine from './FoodCuisine';
import GenrePicker from './GenrePicker';
import { inputBusyPeriodFromGcal } from '../../reusable-functions/GoogleCalendarGetBusyPeriods';

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const IndividualPlanModal = ({ onClose, board, userID }) => {
    useEffect(() => {
        extractAndSetTopGenres(board.preferences);
        extractAndSetInvitees(board.invitees);
    }, []);

    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button
    const [invitees, setInvitees] = useState([]);
    const [topGenres, setTopGenres] = useState([]);
    const [allGenres, setAllGenres] = useState([['ADVENTURE', false], ['ARTS', false],
    ['LEISURE', false], ['NATURE', false], ['NIGHTLIFE', false], ['FOOD', false]]);

    const [location, setLocation] = useState([['NORTH', false], ['EAST', false],
    ['WEST', false], ['CENTRAL', false]]);

    const [cuisine, setCuisine] = useState([['ASIAN', false], ['WESTERN', false],
    ['CHINESE', false], ['KOREAN', false], ['INDIAN', false], ['JAPANESE', false],
    ['CAFE', false], ['LOCAL', false],]);

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


    const finalizeBoard = () => {
    }

    const inputAvailabilities = () => {
        inputBusyPeriodFromGcal(userID, selectedDate, board.boardID);
        setIsButtonDisabled(true); // Prevent syncing google calendar twice

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
                <TouchableOpacity style={[styles.finalizeButton, isButtonDisabled ? { backgroundColor: 'green' } : {}]} onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}>
                    <Text>Input Availabilities</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.finalizeButton} onPress={() => finalizeBoard()}>
                    <Text>Finalize</Text>
                </TouchableOpacity>
            </View>
        </View >
    );
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
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