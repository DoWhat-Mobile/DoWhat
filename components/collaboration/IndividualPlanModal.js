import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import FoodPrice from './FoodPrice';

const formatDate = (day, month, date) => {
    const possibleDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wenesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const possibleMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const curDay = possibleDays[day];
    const curMonth = possibleMonths[month];
    return curDay + ", " + curMonth + " " + date;
};

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const IndividualPlanModal = ({ onClose, board }) => {
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

    const [budget, setBudget] = useState([]);

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

    const renderGenres = (genre, selected, index) => {
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{genre}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View>
                    <TouchableOpacity style={[styles.genreButton, { backgroundColor: '#e5e5e5' }]}
                        onPress={() => handleGenreSelect(index)}>
                        <Text style={{ fontFamily: 'serif', fontSize: 11, fontWeight: '100' }}>{genre}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    const handleGenreSelect = (index) => {
        var newState = [...allGenres];
        newState[index][1] = !newState[index][1]; // Toggle between true/false
        setAllGenres([...newState]);
    }

    const GenrePicker = () => {
        return (
            <FlatList
                data={allGenres}
                horizontal={true}
                renderItem={({ item, index }) => renderGenres(item[0], item[1], index)}
                keyExtractor={(item, index) => item + index}
            />
        );
    }

    const renderLocation = () => {

    }

    const renderCuisine = () => {

    }

    const handlePricePress = () => {

    }

    const renderFoodFilter = (foodIsSelected) => {
        if (foodIsSelected) {
            return (
                <View style={styles.foodFilters}>
                    <Text style={styles.genreSelectionText}>Location:</Text>
                    <FlatList
                        data={location}
                        horizontal={true}
                        renderItem={({ item, index }) => renderLocation(item[0], item[1], index)}
                        keyExtractor={(item, index) => item + index}
                    />
                    <Text style={styles.genreSelectionText}>Cuisine:</Text>
                    <FlatList
                        data={cuisine}
                        horizontal={true}
                        renderItem={({ item, index }) => renderCuisine(item[0], item[1], index)}
                        keyExtractor={(item, index) => item + index}
                    />
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
        setIsButtonDisabled(true); // Prevent syncing google calendar twice

    }

    const selectedDate = new Date(board.selected_date);

    return (
        <View style={styles.modal}>
            <Text style={styles.headerText}>Your Outing on {formatDate(selectedDate.getDay(), selectedDate.getMonth(), selectedDate.getDate())}</Text>
            <AntDesign name="close" size={24}
                onPress={() => onClose()}
                style={styles.close}
            />

            <View style={styles.body}>
                <View style={styles.genreSelection}>
                    <Text style={styles.genreSelectionText}>Select your moods:</Text>
                    <GenrePicker />
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

export default connect()(IndividualPlanModal);

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
        borderWidth: 1,
        margin: 10,
    },
    genreSelection: {
        borderBottomWidth: 1
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
        borderBottomWidth: 1
    },
    footer: {
        flex: 1,
        borderWidth: 1,
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