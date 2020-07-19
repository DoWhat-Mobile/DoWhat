import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, SectionList, ActivityIndicator,
    Image, FlatList, TouchableOpacity, Dimensions, Alert
} from "react-native";
import { useFocusEffect } from '@react-navigation/native'
import { Card } from 'react-native-elements';
import firebase from '../../database/firebase';
import { handleEventsOf } from '../../reusable-functions/HomeFeedLogic';
import { TIH_API_KEY } from 'react-native-dotenv';
import { connect } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadMore from 'react-native-read-more-text';

/**
 * User feed in home page. Has 3 divisions: Show whats popular, eateries, and activities
 * that the user does not normally engage in.
 * @param {*} props 
 */
const Feed = (props) => {
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            getDataFromFirebase(); // Subscribe to changes
            return () => { isMounted = false };
        }, [props.allEvents])
    )

    const [isLoading, setIsLoading] = useState(true);
    const [whatsPopularData, setWhatsPopularData] = useState([])
    const [hungryData, setHungryData] = useState([]);
    const [somethingNewData, setSomethingNewData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [favourites, setFavourites] = useState({});
    const [viewFavourites, setViewFavourites] = useState(false);
    const [addingFavouritesToPlan, setAddingFavouritesToPlan] = useState(false);

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
                        setFavourites(userFavourites)
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
        eventWithRating.rating = event[1]
        eventWithRating.votes = 0; // For use in collaboration board
        updates['/favourites/' + event[0].id] = eventWithRating;

        firebase.database().ref('/users/' + props.userID)
            .update(updates);

        // Add to component state, so no need to pull data from Firebase
        var additionalEvent = {};
        additionalEvent[event[0].id] = eventWithRating;
        setFavourites(Object.assign({}, favourites, additionalEvent))

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

    // Event represents an event node in the database of events
    const handleEventPress = (event, sectionTitle, index, foodIndex) => {
        if (addingFavouritesToPlan) {
            alert("Hello")
        }
        handleAddToFavourites(event, sectionTitle, index, foodIndex);
        //  Alert.alert(
        //      'Add to favourites',
        //      'Do you want to add this event to your favourites?',
        //      [
        //          {
        //              text: 'No',
        //              onPress: () => console.log('Cancel Pressed'),
        //              style: 'cancel'
        //          },
        //          { text: 'Yes', onPress: () => handleAddToFavourites(event, sectionTitle, index, foodIndex) }
        //      ],
        //      { cancelable: false }
        //  )
    }

    const handleFavouriteEventPress = (event) => {
        Alert.alert(
            'Add to plan',
            'Where would you like to include this favourite event?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                { text: 'Collaboration', onPress: () => handleAddFavouriteToCollab(event) },
                { text: 'Personal', onPress: () => handleAddFavouriteToPersonal(event) }
            ],
            { cancelable: true }
        )
    }

    const handleAddFavouriteToCollab = (event) => {
        props.navigation.navigate("Plan", { event: event, addingFavourite: true })
    }

    const handleAddFavouriteToPersonal = (event) => {
        Alert.alert(
            'Successfully added',
            'Go to your plan and confirm it to your finalized timeline!',
            [
                { text: 'DONE' },
            ],
            { cancelable: true }
        )
    }

    const handleRemoveFavourites = (event) => {
        // Remove from Firebase
        firebase.database()
            .ref('/users/' + props.userID + '/favourites/' + event[0].id)
            .remove();

        // Remove from component state
        var newFavourites = Object.assign({}, favourites);
        delete newFavourites[event[0].id];
        setFavourites(newFavourites);
    }

    const handleTitlePress = (title) => {
        if (title == 'What is currently popular') {
            alert("Future enhancements")
        } else if (title == 'Hungry?') {
            alert("Future enhancements for Hungry")
        } else {
            alert("Future enhancements for Find something new")
        }
    }

    // Takes in indivdual event array and inject it to <Card>, for vertical views 
    const renderEventCard = (event, isEventFood, sectionTitle, index, foodIndex) => {
        var isEventFavourited = false;
        // Two checks for event favourited, so we don't have to subscribe to Firebase changes.
        // (Firebase changes causes frequent and unecessary re-render of home feed events)
        if (favourites.hasOwnProperty(event[0].id) || event[0].favourited) {
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
                {/*<TouchableOpacity disabled={sectionTitle == 'favourites'}
                onPress={() => handleEventPress(event, sectionTitle, index, foodIndex)}>*/}
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
                                onPress={() => handleEventPress(event, sectionTitle, index, foodIndex)}>
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
                            ? <View style={{
                                flexDirection: 'row', justifyContent: 'space-between',
                                marginTop: 5,
                            }}>
                                <TouchableOpacity style={styles.favouritesButton}
                                    onPress={() => handleRemoveFavourites(event)}>
                                    <Text style={styles.favouritesButtonText}>
                                        REMOVE FROM FAVOURITES
                                        </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.favouritesButton}
                                    onPress={() => handleFavouriteEventPress(event)}>
                                    <Text style={styles.favouritesButtonText}>ADD TO PLAN</Text>
                                </TouchableOpacity>
                            </View>
                            : null}

                    </Card>
                </View>
                {/*</TouchableOpacity> */}
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

    // const toggle

    const renderListHeaderComponent = (isFavouritesHeader) => {
        return (
            <View style={[styles.header, addingFavouritesToPlan
                ? { backgroundColor: '#BEBEBE' } : {}]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.headerText}>Check these categories out!</Text>
                    <TouchableOpacity onPress={signOut}>
                        <Text style={{
                            color: "grey", textDecorationLine: 'underline',
                            marginRight: 5, marginTop: 2
                        }}>
                            Sign out
                                    </Text>
                    </TouchableOpacity>
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

                            {addingFavouritesToPlan
                                ? <View>
                                    <TouchableOpacity onPress={() => setAddingFavouritesToPlan(false)}
                                        style={[styles.headerCategory, { backgroundColor: '#e63946' }]}>
                                        <MaterialCommunityIcons name="reply" color={'white'} size={30} />
                                    </TouchableOpacity>
                                    <CategoryTitleText text='Back' />
                                </View>
                                : null}
                            {addingFavouritesToPlan
                                ? <View>
                                    <TouchableOpacity onPress={() => setAddingFavouritesToPlan(false)}
                                        style={[styles.headerCategory, { backgroundColor: 'green' }]}>
                                        <MaterialCommunityIcons name="check-bold" color={'white'} size={30} />
                                    </TouchableOpacity>
                                    <CategoryTitleText text='Done' />
                                </View>
                                : <View>
                                    <TouchableOpacity onPress={() => setAddingFavouritesToPlan(true)}
                                        style={[styles.headerCategory, { backgroundColor: '#e63946' }]}>
                                        <MaterialCommunityIcons name="animation" color={'white'} size={30} />
                                    </TouchableOpacity>
                                    <CategoryTitleText text='Plan Outing with Favourites' />
                                </View>
                            }
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
        var favouritesArr = [];
        for (var event in favourites) {
            const formattedData = [favourites[event], favourites[event].rating, false] // Last boolean if is adding
            favouritesArr.push(formattedData)
        }
        // Favourites view
        return (
            < View style={[styles.container, addingFavouritesToPlan
                ? { backgroundColor: '#BEBEBE' } : {}]} >
                <SectionList
                    onRefresh={() => refreshPage()}
                    ref={ref => (sectionListRef = ref)}
                    ListHeaderComponent={() => renderListHeaderComponent(true)}
                    progressViewOffset={100}
                    refreshing={isRefreshing}
                    sections={[
                        { title: "My favourites", data: favouritesArr }
                    ]}
                    renderItem={({ item, section, index }) =>
                        renderEventCard(item, false, 'favourites', 0, 0)
                    }
                    renderSectionHeader={({ section }) =>
                        <View style={styles.sectionHeader}>
                            <TouchableOpacity
                                onPress={() => handleTitlePress(section.title)}>
                                <Text style={styles.sectionHeaderText}>{section.title}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    keyExtractor={(item, index) => index}
                />
                { // Render empty state favourites screen
                    favouritesArr.length == 0
                        ? <View style={{ flex: 20, justifyContent: 'center' }}>
                            <Text style={{
                                fontSize: 20, fontWeight: 'bold', textAlign: "center",
                                fontFamily: 'serif'
                            }}>No favourites added yet.</Text>
                            <Text style={{
                                margin: 5, fontSize: 14, color: 'grey', textAlign: "center",
                                fontFamily: 'serif'
                            }}>Add an event to favourites by clicking on the event in the home feed.</Text>
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
                        <TouchableOpacity
                            onPress={() => handleTitlePress(section.title)}>
                            <Text style={styles.sectionHeaderText}>{section.title}</Text>
                        </TouchableOpacity>
                    </View>
                }
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

const mapStateToProps = (state) => {
    return {
        allEvents: state.add_events.events,
        userID: state.add_events.userID
    };
};

export default connect(mapStateToProps, null)(Feed);

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
    }
});