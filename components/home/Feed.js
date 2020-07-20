import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, SectionList, ActivityIndicator,
    Image, FlatList, TouchableOpacity, Dimensions, Alert
} from "react-native";
import { useFocusEffect } from '@react-navigation/native'
import { Card, Badge } from 'react-native-elements';
import firebase from '../../database/firebase';
import { handleEventsOf } from '../../reusable-functions/HomeFeedLogic';
import { TIH_API_KEY } from 'react-native-dotenv';
import { connect } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadMore from 'react-native-read-more-text';
import {
    setAddingFavourites, addFavouritesToPlan,
    setAddingFavouritesToExistsingBoard
} from '../../actions/favourite_event_actions';
import SelectedFavouritesSummaryModal from './SelectedFavouritesSummaryModal';

/**
 * User feed in home page. Has 3 divisions: Show whats popular, eateries, and activities
 * that the user does not normally engage in.
 * @param {*} props 
 */
const Feed = (props) => {
    useFocusEffect(
        useCallback(() => {
            var isMounted = true;
            getDataFromFirebase(); // Subscribe to changes
            return () => { isMounted = false };
        }, [props.allEvents])
    )

    const [isLoading, setIsLoading] = useState(true);
    const [whatsPopularData, setWhatsPopularData] = useState([])
    const [hungryData, setHungryData] = useState([]);
    const [somethingNewData, setSomethingNewData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [favourites, setFavourites] = useState([]); // All the favourited events, and whether or not they are selected
    const [viewFavourites, setViewFavourites] = useState(false); // Between favourites view and all events view
    const [addingFavouritesToPlan, setAddingFavouritesToPlan] = useState(false); // Selecting which favourited events to use in plan
    const [anyFavouritesClicked, setAnyFavouritesClicked] = useState(false); // Show bottom summary cart when any clicked
    const [numberOfFavouritesClicked, setNumberOfFavouritesClicked] = useState(0);
    const [favouriteSummaryModalVisible, setFavouriteSummaryModalVisibile] = useState(false); // Summary of all events in cart 

    const getDataFromFirebase = async () => {
        try {
            const database = firebase.database();
            const userId = firebase.auth().currentUser.uid;
            database.ref("users/" + userId)
                .once("value")
                .then((snapshot) => {
                    const userData = snapshot.val();
                    const allCategories = props.allEvents; // Get all events from redux state 

                    if (userData.hasOwnProperty("favourites")) {
                        const userFavourites = userData.favourites;
                        var favouritesArr = [];
                        for (var event in userFavourites) {
                            const formattedData = [userFavourites[event],
                            userFavourites[event].rating, false] // Last boolean if is adding
                            favouritesArr.push(formattedData)
                        }
                        setFavourites(favouritesArr)
                    }

                    if (Object.keys(allCategories).length !== 0) { // Check that event has already been loaded from redux state
                        const data = handleEventsOf(allCategories, userData.preferences);
                        setWhatsPopularData(data[0])
                        setHungryData(data[1])
                        setSomethingNewData(data[2])
                        setIsLoading(false)
                    }
                })
        } catch (err) {
            console.log("Error getting data from firebase: ", err);
        }
    }

    const refreshPage = () => {
        setIsRefreshing(true);
        getDataFromFirebase();
        setIsRefreshing(false);
    }

    // Add entire event into user's firebase node under favourites
    const handleAddToFavourites = (event, sectionTitle, index, foodIndex) => {
        var updates = {}
        var eventWithRating = event[0];
        eventWithRating.favourited = true; // Mark as favourited
        eventWithRating.rating = event[1]
        eventWithRating.votes = 0; // For use in collaboration board
        updates['/favourites/' + event[0].id] = eventWithRating;

        firebase.database().ref('/users/' + props.userID)
            .update(updates);

        // Add to component state, so no need to pull data from Firebase
        var additionalEvent = [];
        additionalEvent[0] = eventWithRating; // Entire event object
        additionalEvent[1] = event[1]; // Rating of event
        additionalEvent[2] = false; // Selected or not
        setFavourites([...favourites, additionalEvent])

        // Visual cue to users, add heart to card
        if (sectionTitle == 'Hungry?') {
            var newData = hungryData[index][foodIndex]
            newData[0].favourited = true; // Mark as favourited 
            var finalData = [...hungryData[index]]
            finalData[foodIndex] = newData
            setHungryData([[...finalData]]);

        } else if (sectionTitle == 'Find something new') {
            var newData = somethingNewData[index]
            newData[0].favourited = true; // Mark as favourited 
            var finalData = [...somethingNewData]
            finalData[index] = newData
            setSomethingNewData([...finalData]);

        } else { // What is popular
            var newData = whatsPopularData[index]
            newData[0].favourited = true; // Mark as favourited 
            var finalData = [...whatsPopularData]
            finalData[index] = newData
            setWhatsPopularData([...finalData]);
        }
    }

    const handleDoneSelectingFavourites = () => {
        var allEvents = []
        favourites.forEach(event => { // Include all events selected
            const shouldEventBeAdded = event[2]
            if (shouldEventBeAdded) {
                allEvents.push(event)
            }
        })

        Alert.alert(
            'Add to plan',
            'Where would you like to include all the selected favourite event?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                { text: 'Ongoing collaboration', onPress: () => handleAddFavouriteToCollab(allEvents) },
                { text: 'Start a new plan', onPress: () => handleAddFavouriteToPersonal(allEvents) }
            ],
            { cancelable: true }
        )
    }

    const resetAddingFavourites = () => {
        // If any favourites selected, unselect them.
        var newState = [...favourites]
        newState.forEach(event => {
            event[2] = false; // Unselect
        })
        setNumberOfFavouritesClicked(0)
        setAnyFavouritesClicked(false)
        setFavouriteSummaryModalVisibile(false)
        setAddingFavouritesToPlan(false)
    }

    // Summary cart shows all the favourite events that have been selected to use in planning
    const addToSummaryCart = (event, isEventIncluded) => {
        var anyEventSelected = false;
        var noOfFavsClicked = 0;
        favourites.forEach(selectedEvent => {
            const eventIsSelected = selectedEvent[2];
            if (eventIsSelected) {
                noOfFavsClicked += 1;
                anyEventSelected = true;
            }
        })
        setNumberOfFavouritesClicked(noOfFavsClicked);
        setAnyFavouritesClicked(anyEventSelected);
    }

    // Toggle for whether or not event will be included in planning when adding to plan
    const handleFavouriteEventPress = (event, index) => {
        var newState = [...favourites]
        newState[index][2] = !newState[index][2];
        addToSummaryCart(event, newState[index][2]);
        setFavourites(newState);
    }

    // Functionality of remove button in summary cart
    const removeSelectedFavourite = (eventID) => {
        var newState = [...favourites]
        for (var i = 0; i < newState.length; i++) {
            const currEventID = newState[i][0].id;
            if (currEventID == eventID) {
                newState[i][2] = false; // Unselect
            }
        }
        setFavourites(newState);
        if (numberOfFavouritesClicked - 1 == 0) { // No more favourites clicked, close modals
            setFavouriteSummaryModalVisibile(false);
            setAnyFavouritesClicked(false);
        }
        setNumberOfFavouritesClicked(numberOfFavouritesClicked - 1)
    }

    const handleAddFavouriteToCollab = (allEvents) => {
        props.setAddingFavouritesToExistsingBoard(true) // Mark redux state before navigating
        props.addFavouritesToPlan(allEvents)
        props.navigation.navigate("Plan")
        setViewFavourites(false);
        setAddingFavouritesToPlan(false);
    }

    const handleAddFavouriteToPersonal = (allEvents) => {
        props.setAddingFavourites(true); // Update redux state before navigating
        props.addFavouritesToPlan(allEvents)
        props.navigation.navigate("Plan")
        setViewFavourites(false);
        setAddingFavouritesToPlan(false);
    }

    const handleRemoveFavourites = (event, index) => {
        // Remove from Firebase
        firebase.database()
            .ref('/users/' + props.userID + '/favourites/' + event[0].id)
            .remove();

        // Remove from component state
        var newFavourites = [...favourites]
        newFavourites = newFavourites.filter(selectedEvent =>
            selectedEvent[0].id != event[0].id)
        setFavourites(newFavourites);
    }

    const checkIfEventIsFavourited = (event) => {
        var isEventFavourited = false;
        favourites.forEach(selectedEvent => {
            const favouritedEventID = selectedEvent[0].id
            if (favouritedEventID == event[0].id) {
                isEventFavourited = true;
            }
        })

        return event[0].favourited
            || isEventFavourited;
    }

    // Takes in indivdual event array and inject it to <Card>, for vertical views 
    const renderEventCard = (event, isEventFood, sectionTitle, index, foodIndex) => {
        const isEventBeingAddedToPlan = event[2];

        var isEventFavourited = false; // Separate variable as .favourited property dont exist
        if (checkIfEventIsFavourited(event)) {
            isEventFavourited = true;
        }

        const renderTruncatedFooter = (handlePress) => {
            return (
                <Text
                    style={{ color: "#595959", marginTop: 5 }}
                    onPress={handlePress}
                >
                    Read more
                </Text>
            );
        };

        const renderRevealedFooter = (handlePress) => {
            return (
                <Text
                    style={{ color: "#595959", marginTop: 5 }}
                    onPress={handlePress}
                >
                    Show less
                </Text>
            );
        };

        var imageURI = event[0].imageURL;
        const eventRatings = event[1] + '/5'

        // If imageURI is a code, convert it to URI using TIH API
        if (imageURI.substring(0, 5) != 'https') {
            imageURI = 'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
                imageURI + '?apikey=' + TIH_API_KEY;
        }

        return (
            <View>
                <View style={{ width: Dimensions.get('window').width }}>
                    <Card
                        style={{ height: (Dimensions.get('window').height / 2) }}
                        title={event[0].title}
                    >
                        <Image
                            source={{ uri: imageURI }}
                            style={isEventFood
                                ? { height: 100, width: '100%' }
                                : { height: 100, width: Dimensions.get('window').width * 0.85 }}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <MaterialCommunityIcons name="star" color={'#1d3557'} size={18} />
                                <Text style={{ fontSize: 12, color: '#1d3557', marginTop: 2, }}> {eventRatings}</Text>
                            </View>
                            <TouchableOpacity disabled={sectionTitle == 'favourites'}
                                onPress={() => handleAddToFavourites(event, sectionTitle, index, foodIndex)}>
                                {isEventFavourited
                                    ? <MaterialCommunityIcons name="heart" color={'#e63946'} size={18} />
                                    : <MaterialCommunityIcons name="heart-outline" color={'black'} size={18} />}
                            </TouchableOpacity>
                        </View>

                        <ReadMore
                            numberOfLines={4}
                            renderTruncatedFooter={renderTruncatedFooter}
                            renderRevealedFooter={renderRevealedFooter}
                        >
                            <Text>
                                {"\n"}
                                {event[0].description}
                            </Text>
                        </ReadMore>

                        {sectionTitle == 'favourites'
                            ? addingFavouritesToPlan
                                ? <View style={{
                                    flexDirection: 'row', justifyContent: 'space-between',
                                    marginTop: 5,
                                }}>
                                    <TouchableOpacity style={styles.favouritesButton}
                                        onPress={() => handleRemoveFavourites(event, index)}>
                                        <Text style={styles.favouritesButtonText}>
                                            REMOVE FROM FAVOURITES
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.favouritesButton}
                                        onPress={() => handleFavouriteEventPress(event, index)}>
                                        <Text style={styles.favouritesButtonText}>
                                            {isEventBeingAddedToPlan
                                                ? 'ADDED'
                                                : 'ADD TO PLAN'
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                : < View style={{
                                    flexDirection: 'row', justifyContent: 'space-between',
                                    marginTop: 5,
                                }}>
                                    <TouchableOpacity style={styles.favouritesButton}
                                        onPress={() => handleRemoveFavourites(event)}>
                                        <Text style={styles.favouritesButtonText}>
                                            REMOVE FROM FAVOURITES
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            : null
                        }

                    </Card>
                </View>
            </View>
        );
    }

    /**
     * Horizontal <FlatList> for food choices
     * @param {*} event is a 2D array of [[{eventDetails}, ratings], ...] 
     */
    const formatFoodArray = (allEvents, sectionTitle, sectionIndex) => {
        return (
            <FlatList
                data={allEvents}
                horizontal={true}
                renderItem={({ item, index }) => (
                    renderEventCard(item, true, sectionTitle, sectionIndex, index) // Food index is the inner flatlist index for food list 
                )}
                keyExtractor={(item, index) => item + index}
            />
        )
    }

    const renderFeed = (item, section, index) => {
        if (section.title == 'Hungry?') { // Render eateries
            return formatFoodArray(item, section.title, index);
        }
        return renderEventCard(item, false, section.title, index); // not food
    }

    const scroll = (sectionIndex, itemIndex) => {
        sectionListRef.scrollToLocation({ sectionIndex: sectionIndex, itemIndex: itemIndex, viewPosition: 0, viewOffSet: 10 })
    }

    const CategoryTitleText = ({ text }) => {
        return (<Text style={styles.CategoryTitleText}>{text}</Text>)
    }

    const renderListHeaderComponent = (isFavouritesHeader) => {
        return (
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.headerText}>
                        {isFavouritesHeader
                            ? 'Plan something!'
                            : 'Check these categories out!'
                        }
                    </Text>
                    {isFavouritesHeader
                        ? null
                        : <TouchableOpacity onPress={signOut}>
                            <Text style={{
                                color: "grey", textDecorationLine: 'underline',
                                marginRight: 5, marginTop: 2
                            }}>
                                Sign out
                                    </Text>
                        </TouchableOpacity>
                    }

                </View>
                {isFavouritesHeader
                    ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, }}>
                        <View style={{ flex: 2.5, flexDirection: 'row', justifyContent: 'space-around' }}>
                            <View>
                                <TouchableOpacity onPress={() => setViewFavourites(false)}
                                    style={styles.headerCategory}>
                                    <MaterialCommunityIcons name="reorder-horizontal" color={'black'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='See all Events' />
                            </View>
                        </View>

                        {addingFavouritesToPlan
                            ? <View style={{ flex: 1, borderLeftWidth: 1, marginLeft: 5 }}>
                                <TouchableOpacity onPress={() => resetAddingFavourites()}
                                    style={[styles.headerCategory, {
                                        backgroundColor: '#e63946',
                                    }]}>
                                    <MaterialCommunityIcons name="reply" color={'white'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='Back' />
                            </View>
                            : <View style={{ flex: 1, borderLeftWidth: 1, marginLeft: 5 }}>
                                <TouchableOpacity disabled={addingFavouritesToPlan}
                                    onPress={() => setAddingFavouritesToPlan(true)}
                                    style={[styles.headerCategory, { backgroundColor: '#ff664a' }]}>
                                    <MaterialCommunityIcons name="animation" color={'white'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='Plan with Favourites' />
                            </View>}

                    </View>
                    : <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, }}>
                        <View style={{ flex: 2.5, flexDirection: 'row', justifyContent: 'space-around' }}>
                            <View>
                                <TouchableOpacity onPress={() => setViewFavourites(true)}
                                    style={styles.headerCategory}>
                                    <MaterialCommunityIcons name="cards-heart" color={'#d00000'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='Favourites' />
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => scroll(0, 0)}
                                    style={styles.headerCategory}>
                                    <MaterialCommunityIcons name="star" color={'#CCCC00'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='Popular' />
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => scroll(1, 0)}
                                    style={styles.headerCategory}>
                                    <MaterialCommunityIcons name="silverware-variant" color={'#9d8189'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='Eateries' />
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => scroll(2, 0)}
                                    style={styles.headerCategory}>
                                    <MaterialCommunityIcons name="city" color={'#3d5a80'} size={30} />
                                </TouchableOpacity>
                                <CategoryTitleText text='Discover' />
                            </View>
                        </View>
                        <View style={{ flex: 1, borderLeftWidth: 1, marginLeft: 5 }}>
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("Plan", { addingFavourite: false })}
                                style={[styles.headerCategory, { backgroundColor: '#e63946' }]}>
                                <MaterialCommunityIcons name="feature-search" color={'white'} size={30} />
                            </TouchableOpacity>
                            <CategoryTitleText text='Plan with Friends' />
                        </View>
                    </View>

                }
            </View>
        )
    }

    const signOut = () => {
        firebase.auth().signOut();
        props.navigation.navigate("Auth")
    }

    var sectionListRef = {} // For anchor tag use

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    }

    if (viewFavourites) {
        // Favourites view
        return (
            < View style={styles.container} >

                <SectionList
                    onRefresh={() => refreshPage()}
                    ref={ref => (sectionListRef = ref)}
                    ListHeaderComponent={() => renderListHeaderComponent(true)}
                    progressViewOffset={100}
                    refreshing={isRefreshing}
                    sections={[
                        { title: "My favourites", data: favourites }
                    ]}
                    renderItem={({ item, section, index }) =>
                        renderEventCard(item, false, 'favourites', index, 0)
                    }
                    renderSectionHeader={({ section }) =>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{section.title}</Text>
                        </View>
                    }
                    keyExtractor={(item, index) => index}
                />

                {favouriteSummaryModalVisible // Modal of cart sumamry
                    ? <SelectedFavouritesSummaryModal onClose={() => setFavouriteSummaryModalVisibile(false)}
                        allEvents={favourites} removeSelectedFavourite={removeSelectedFavourite} />
                    : null
                }

                {anyFavouritesClicked
                    ? <View style={{ opacity: 100 }}>
                        <Badge
                            value={<MaterialCommunityIcons name="dots-horizontal"
                                color={'white'} size={28} />}
                            badgeStyle={{
                                backgroundColor: '#cc5237', paddingTop: 15,
                                paddingBottom: 15, borderTopLeftRadius: 10, borderTopRightRadius: 10,
                                borderWidth: 0,
                            }}
                            onPress={() =>
                                setFavouriteSummaryModalVisibile(!favouriteSummaryModalVisible)}
                            containerStyle={{
                                position: 'relative', top: 5, right: -100
                            }}
                        />

                        <View style={{
                            flexDirection: 'row', justifyContent: 'space-between',
                            padding: 10, borderRadius: 5, marginLeft: 20, marginRight: 20,
                            backgroundColor: "#cc5327",
                        }}>
                            <Text style={{
                                textAlign: "center", color: 'white', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: 14, fontFamily: 'serif',
                                marginTop: 3, marginLeft: 10,
                            }}>
                                {numberOfFavouritesClicked} |  Use events for plan
                            </Text>

                            <TouchableOpacity onPress={handleDoneSelectingFavourites}
                                style={{
                                    padding: 5, backgroundColor: 'white', borderRadius: 5,
                                }}>
                                <MaterialCommunityIcons name="greater-than" color={'black'} size={16} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    : null
                }

                { // Render empty state favourites screen
                    favourites.length == 0
                        ? <View style={{ flex: 20, justifyContent: 'center' }}>
                            <Text style={{
                                fontSize: 20, fontWeight: 'bold', textAlign: "center",
                                fontFamily: 'serif'
                            }}>No favourites added yet.</Text>
                            <Text style={{
                                margin: 5, fontSize: 14, color: 'grey', textAlign: "center",
                                fontFamily: 'serif'
                            }}>Add an event to favourites by clicking on the heart
                             in the event in the home feed.</Text>
                        </View>
                        : null
                }
            </View >
        )
    }

    // Normal view
    return (
        <View style={styles.container}>
            <SectionList
                onRefresh={() => refreshPage()}
                ref={ref => (sectionListRef = ref)}
                ListHeaderComponent={() => renderListHeaderComponent(false)}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "What is currently popular", data: whatsPopularData }, // eventData[0] is an array of data items
                    { title: "Hungry?", data: hungryData }, // eventData[1] is an array of one element: [data]
                    { title: "Find something new", data: somethingNewData } // eventData[2] is an array data items 
                ]}
                renderItem={({ item, section, index }) => renderFeed(item, section, index)}
                renderSectionHeader={({ section }) =>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{section.title}</Text>
                    </View>
                }
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

const mapDispatchToProps = {
    setAddingFavourites, addFavouritesToPlan, setAddingFavouritesToExistsingBoard
}

const mapStateToProps = (state) => {
    return {
        allEvents: state.add_events.events,
        userID: state.add_events.userID
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);

const styles = StyleSheet.create({
    container: {
        marginTop: '2%',
        flex: 1,
    },
    headerText: {
        color: 'grey',
        fontFamily: 'serif',
        fontSize: 16,
        marginLeft: '2%',
        textDecorationLine: 'underline',
        textShadowColor: '#e85d04',
    },
    headerCategory: {
        borderWidth: 0.5,
        padding: 10,
        borderRadius: 5,
        elevation: 0.01,
        alignSelf: 'center',
    },
    header: {
        backgroundColor: '#f0efeb',
        margin: 5,
        elevation: 0.1,
    },
    CategoryTitleText: {
        color: 'grey',
        textAlign: 'center',
        fontSize: 12,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'serif',
        color: '#f1faee',
        marginLeft: '2%',
    },
    sectionHeader: {
        marginRight: 15,
        marginTop: 5,
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: 'black',
        backgroundColor: '#e63946',
    },
    cardButton: {
        borderRadius: 5,
        marginLeft: '1%',
        marginRight: '1%',
        borderWidth: 0.2,
        borderColor: 'black',
        backgroundColor: '#457b9d',
    },
    moreDetailsButtonText: {
        color: '#f1faee',
        fontWeight: '300',
        fontFamily: 'serif',
        textAlign: "center",
    },
    favouritesButton: {
        borderWidth: 0.1,
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#e63946',
    },
    favouritesButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
    },
    modalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,

    }
});