import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList, Alert,
    ScrollView
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { formatDate } from '../DateSelection';
import FoodPrice from './FoodPrice';
import FoodLocation from './FoodLocation';
import FoodCuisine from './FoodCuisine';
import GenrePicker from './GenrePicker';
import firebase from '../../database/firebase'
import { inputBusyPeriodFromGcal } from '../../reusable-functions/GoogleCalendarGetBusyPeriods';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, Badge, Tooltip } from 'react-native-elements'
import SuggestedFavouriteActivities from './SuggestedFavouriteActivities'
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const IndividualPlanModal = ({ onClose, board, userID, currUserName }) => {
    useEffect(() => {
        listenToGenreChanges();

        // Unsubscribe to changes when component unmount
        return () => {
            firebase.database().
                ref('collab_boards/' + board.boardID + '/preferences').off()
        }
    }, []);

    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button
    const [topGenres, setTopGenres] = useState([]);
    const [allGenres, setAllGenres] = useState([['ADVENTURE', false], ['ARTS', false],
    ['LEISURE', false], ['NATURE', false], ['NIGHTLIFE', false], ['FOOD', false]]);

    const [location, setLocation] = useState([['NORTH', false], ['EAST', false],
    ['WEST', false], ['CENTRAL', false]]);

    const [cuisine, setCuisine] = useState([['ASIAN', false], ['WESTERN', false],
    ['CHINESE', false], ['KOREAN', false], ['INDIAN', false], ['JAPANESE', false],
    ['CAFE', false], ['HAWKER', false],]);

    const [budget, setBudget] = useState(0);
    const [favourites, setFavourites] = useState(() => {
        let object = board.favourites;
        if (object == undefined) return []; // No favourites

        var finalFavouritesArray = [];
        for (var key in object) {
            const arr = [object[key], false]
            finalFavouritesArray.push(arr);
        }
        return finalFavouritesArray
    })

    // Subscribe to changes in Firebase
    const listenToGenreChanges = () => {
        // Add history of messages to the collab board
        firebase.database().ref('collab_boards/' + board.boardID + '/preferences')
            .on('value', snapshot => {
                extractAndSetTopGenres(snapshot.val());
            });
    }

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
        for (var firebaseID in object) {
            const userDetails = [object[firebaseID].name,
            object[firebaseID].profile_pic, object[firebaseID].isUserHost];
            newState.push(userDetails);
        }
        return newState;
    }

    const handleFavouritesSelect = (index) => {
        var newState = [...favourites];
        newState[index][1] = !newState[index][1]; // Toggle between true/false
        setFavourites([...newState]);

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
        return (
            <View pointerEvents={foodIsSelected ? 'auto' : 'none'}
                style={styles.foodFilters}>
                <FoodLocation location={location} handleLocationSelect={handleLocationSelect}
                    preferences={board.food_filters.area} />
                <FoodCuisine cuisine={cuisine} handleCuisineSelect={handleCuisineSelect}
                    preferences={board.food_filters.cuisine} />
                <FoodPrice handlePricePress={(price) => handlePricePress(price)} />
            </View>
        );
    }

    const formatInvitee = (name, pictureURL, isUserHost) => {
        const userName = name.replace(/_/g, ' ');
        return (
            <View style={{
                width: 75, height: 100, margin: 5, marginTop: 10,
                alignItems: "center"
            }}>
                <Avatar imageProps={{ borderRadius: 10 }}
                    source={{
                        uri: pictureURL
                    }}
                    size={50}
                />
                {isUserHost
                    ? <Badge
                        status="primary"
                        containerStyle={{ position: 'absolute', top: -4, left: -4 }}
                        value={'Host'}
                    />
                    : null}

                <Text style={{
                    fontFamily: 'serif', fontSize: 11, fontWeight: '100',
                    textAlign: "center", color: "#5C5656", marginTop: 4,
                }}>{userName}</Text>
            </View >
        )
    }

    const renderInvitees = (invitees, rejectees) => {
        const formattedInvitees = extractAndSetInvitees(invitees);
        const formattedRejectees = rejectees == undefined
            ? []
            : extractAndSetInvitees(rejectees); // Users who opted out
        const data = [...formattedInvitees, ...formattedRejectees];

        return (
            <View style={{ flex: 1, }}>
                <Text style={{
                    fontSize: 16, fontWeight: '800', fontFamily: 'serif',
                    marginLeft: 16, marginTop: 5
                }}>
                    Invited ({data.length})
                    </Text>
                <FlatList
                    data={data}
                    horizontal={true}
                    renderItem={({ item, index }) => formatInvitee(item[0], item[1], item[2])}
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

    // Increment votes accordingly
    const updateFavouritesVotes = (prevState, currState) => {
        if (board.favourites == undefined) return null; //No favourites to begin with

        var newState = JSON.parse(JSON.stringify(prevState)); // Deep copy to not mutate component's board state
        currState.forEach(x => {
            const eventID = x[0].id;
            const selected = x[1];
            if (selected) {
                newState[eventID].votes += 1;
            }
        })
        return newState;
    }

    // Finalize updates firebase with the user's inputted preference votes
    const finalizeBoard = () => {
        var updates = {}
        const updatedPreference = updateGenres(board.preferences, allGenres)
        const updatedFoodFilters = updateFoodFilters(board.food_filters, location, cuisine, budget)
        const updatedFavourites = updateFavouritesVotes(board.favourites, favourites);
        updates['preferences'] = updatedPreference;
        updates['food_filters'] = updatedFoodFilters;
        updates['favourites'] = updatedFavourites;

        //  var addFinalizedUser = {};
        //  addFinalizedUser[currUserName] = userID;
        updates['finalized/' + currUserName] = userID;

        firebase.database()
            .ref('collab_boards/' + board.boardID)
            .update(updates)

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
                    <TouchableOpacity style={[styles.finalizeButton, { backgroundColor: '#2a9d8f', borderWidth: 0.1 }]}
                        disabled={true}
                        onPress={() => finalizeBoard()}>
                        <Text style={{ color: 'white', fontFamily: 'serif' }}>
                            Availabilities Inputted
                            </Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <TouchableOpacity style={styles.finalizeButton} onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}>
                    <Text style={{ fontFamily: 'serif' }}>Input Availabilities</Text>
                </TouchableOpacity>
            );
        }
    }

    // Top portion of modal, which is identical for both host and invitees' board
    const renderTopPortion = (isUserHost) => {
        return (
            <View>
                <View style={{ height: 300, backgroundColor: '#e86830', position: 'absolute' }}>
                </View>
                <LinearGradient
                    colors={['#e86830', '#e86838']}
                    start={[0.1, 0.1]}
                    end={[0.9, 0.9]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 120,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                    }}
                />
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerText}>
                            Your outing on {formatDate(selectedDate.getDay(),
                            selectedDate.getMonth(), selectedDate.getDate())}
                        </Text>
                        <Text style={{ color: '#f0f0f0', fontFamily: 'serif', fontSize: 12 }}>
                            Hosted by {isUserHost ? 'you' : board.host.replace(/_/g, ' ')}
                        </Text>
                    </View>
                    <View>
                        <AntDesign name="close" size={24}
                            onPress={() => onClose()}
                            style={styles.close}
                        />
                    </View>
                </View>
            </View>
        )
    }

    // Check if current user has already inputted preferences
    const userHasFinalized = () => {
        for (var name in board.finalized) {
            if (board.finalized[name] == userID) {
                return true;
            }
        }
        return false;
    }

    // When user opts out, handle database updates
    const handleOptOut = () => {
        var updates = {}
        updates['/collab_boards/' + board.boardID + '/invitees/' + userID] = null;
        // Transfer user information to rejected node
        updates['/collab_boards/' + board.boardID + '/rejected/' + userID] = board.invitees[userID];
        // Remove from user's collab boards list
        updates['/users/' + userID + '/collab_boards/' + board.boardID] = null;
        updates['/collab_boards/' + board.boardID + '/finalized/' + currUserName] = userID;

        firebase.database()
            .ref()
            .update(updates)
        onClose();
    }

    const selectedDate = new Date(board.selected_date);

    if (board.isUserHost || userHasFinalized()) {
        return (
            <View style={styles.modal}>
                {renderTopPortion(board.isUserHost)}
                <View style={styles.invitedPeople}>
                    {renderInvitees(board.invitees, board.rejected)}
                </View>
                <View style={[styles.body, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={styles.sectionHeaderText}>
                        You have successfully inputted your preferences
                        </Text>
                    <Text style={styles.sectionSubHeaderText}>
                        Please wait for all your friends to input their preferences
                    </Text>

                </View>
            </View >
        );
    }

    return (
        <ScrollView style={styles.modal}>
            {renderTopPortion(board.isUserHost)}

            <View style={styles.invitedPeople}>
                {renderInvitees(board.invitees, board.rejected)}
            </View>

            <View style={styles.body}>
                <View style={styles.genreSelection}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: "column" }}>
                            <Text style={styles.sectionHeaderText}>Possible Preferences {'&'} Genres</Text>
                            <Text style={styles.sectionSubHeaderText}>
                                Select according to your preference
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#5C5656', fontSize: 14, marginTop: 2 }}>Finalized </Text>
                            <Text style={{
                                borderWidth: 0.2, padding: 2, backgroundColor: '#E86830',
                                borderColor: 'grey', borderRadius: 5, textAlign: 'center',
                                paddingLeft: 5, paddingRight: 5, color: '#FEFBFA', marginBottom: 15
                            }}>
                                {Object.keys(board.finalized).length}/
                                {Object.keys(board.invitees).length +
                                    (board.hasOwnProperty('rejected')
                                        ? Object.keys(board.rejected).length : 0)}
                            </Text>
                        </View>
                    </View>
                    <GenrePicker allGenres={allGenres} handleGenreSelect={handleGenreSelect}
                        topGenres={topGenres} preferences={board.preferences} />
                </View>
                {renderFoodFilter(allGenres[5][1])}
            </View>

            <View style={{
                flexDirection: 'column', height: 170,
                borderColor: 'grey', borderBottomWidth: 0.2, marginBottom: 10,
            }}>
                <SuggestedFavouriteActivities
                    handleFavouritesSelect={handleFavouritesSelect}
                    activities={favourites} />
            </View>

            <View style={styles.footer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column' }}>
                        <Tooltip
                            height={120}
                            width={200}
                            overlayColor={'transparent'}
                            backgroundColor={'#E86830'}
                            popover={<Text style={{ color: 'white', textAlign: 'center' }}>
                                This is your available timings
                                for the selected date. It will be used to find a common timing
                                between you and your friends for the finalized timeline.
                        </Text>}>
                            <Text style={styles.sectionHeaderText}>Possible Timings</Text>
                        </Tooltip>

                        <Text style={styles.sectionSubHeaderText}>
                            Input your available timings
                 </Text>
                    </View>
                    {renderInputAvailabilitiesButton()}
                </View>
            </View>

            <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={() => finalizeBoard()}>
                    <Text style={{
                        fontFamily: 'serif', color: '#E86830', fontWeight: 'bold',
                        fontSize: 14
                    }}>Finalize Selections</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert(
                    'Opt Out',
                    'Are you sure you want to opt out of this collaboration?',
                    [
                        {
                            text: 'No',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel'
                        },
                        { text: 'Yes', onPress: () => handleOptOut() }
                    ],
                    { cancelable: false }
                )}>
                    <Text style={{
                        fontFamily: 'serif', color: '#E86830', fontWeight: 'bold',
                        fontSize: 14
                    }}>Opt Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView >
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
        borderRadius: 10,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        fontFamily: 'serif',
        color: '#FEFBFA'
    },
    invitedPeople: {
        position: 'absolute',
        top: '8%',
        left: '5%',
        borderWidth: 0.5,
        height: '20%',
        width: '90%',
        borderRadius: 10,
        elevation: 10,
        backgroundColor: '#FEFBFA',
        borderColor: '#A4A4A6'

    },
    body: {
        flex: 4,
        marginTop: '50%',
    },
    genreSelection: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#e4e4e4',
        paddingBottom: 15
    },
    genreButton: {
        borderWidth: 0.5,
        padding: 3,
        borderRadius: 5,
        margin: 5,
    },
    sectionHeaderText: {
        fontFamily: 'serif',
        fontSize: 15,
        fontWeight: '800'
    },
    sectionSubHeaderText: {
        fontSize: 12, color: '#A4A4A6', fontWeight: '100'
    },
    foodFilters: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#e4e4e4',
        paddingBottom: 10
    },
    footer: {
        flex: 1.6,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1.5,
        borderTopColor: '#e4e4e4',
        paddingTop: 10,

    },
    finalizeButton: {
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
        alignSelf: 'flex-start',
    },
    close: {
        color: 'white',
    },
});