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
            getDataFromFirebase(); // Subscribe to changes
            return () => null;
        }, [props.allEvents])
    )

    const [isLoading, setIsLoading] = useState(true);
    const [whatsPopularData, setWhatsPopularData] = useState([])
    const [hungryData, setHungryData] = useState([]);
    const [somethingNewData, setSomethingNewData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [favourites, setFavourites] = useState({});

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
        updates['/favourites/' + event[0].id] = event[0];

        firebase.database().ref('/users/' + props.userID)
            .update(updates);

        // Visual cue to users, add heart to card
        if (sectionTitle == 'Hungry?') {
            console.log(hungryData[index][foodIndex])
        } else if (sectionTitle == 'Find something new') {
            console.log(somethingNewData[index])

        } else { // What is popular
            console.log(whatsPopularData[index])

        }
    }

    // Event represents an event node in the database of events
    const handleEventPress = (event, sectionTitle, index, foodIndex) => {
        Alert.alert(
            'Add to favourites',
            'Do you want to add this event to your favourites?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                { text: 'Yes', onPress: () => handleAddToFavourites(event, sectionTitle, index, foodIndex) }
            ],
            { cancelable: false }
        )
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
        if (favourites.hasOwnProperty(event[0].id)) {
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
            <TouchableOpacity onPress={() => handleEventPress(event, sectionTitle, index, foodIndex)}>
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
                            {isEventFavourited
                                ? <MaterialCommunityIcons name="google-fit" color={'#e63946'} size={18} />
                                : null}
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
                    </Card>
                </View>
            </TouchableOpacity>
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

    return (
        <View style={styles.container}>
            <SectionList
                onRefresh={() => refreshPage()}
                ref={ref => (sectionListRef = ref)}
                ListHeaderComponent={() => {
                    return (
                        <View style={styles.header}>
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

                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, }}>
                                <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <View>
                                        <TouchableOpacity onPress={() => scroll(0, 0)}
                                            style={styles.headerCategory}>
                                            <MaterialCommunityIcons name="cards-heart" color={'#d00000'} size={30} />
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
                                    <TouchableOpacity onPress={() => props.navigation.navigate("Plan")}
                                        style={[styles.headerCategory, { backgroundColor: '#e63946' }]}>
                                        <MaterialCommunityIcons name="feature-search" color={'white'} size={30} />
                                    </TouchableOpacity>
                                    <CategoryTitleText text='Plan with Friends' />
                                </View>
                            </View>
                        </View>
                    )
                }}
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
    }
});