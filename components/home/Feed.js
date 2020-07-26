import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    ActivityIndicator,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card, Badge } from "react-native-elements";
import firebase from "../../database/firebase";
import { handleEventsOf } from "../../reusable-functions/HomeFeedLogic";
import { TIH_API_KEY } from "react-native-dotenv";
import { connect } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReadMore from "react-native-read-more-text";
import {
    setAddingFavourites,
    addFavouritesToPlan,
    setAddingFavouritesToExistsingBoard,
} from "../../actions/favourite_event_actions";
import SelectedFavouritesSummaryModal from "./SelectedFavouritesSummaryModal";

/**
 * User feed in home page. Has 3 divisions: Show whats popular, eateries, and activities
 * that the user does not normally engage in.
 * @param {*} props
 */
const Feed = (props) => {
    useFocusEffect(
        useCallback(() => {
            var isMounted = true;
            getDataFromFirebase();
            return () => {
                isMounted = false;
            };
        }, [props.allEvents])
    );

    const [isLoading, setIsLoading] = useState(true);
    const [whatsPopularData, setWhatsPopularData] = useState([]);
    const [hungryData, setHungryData] = useState([]);
    const [somethingNewData, setSomethingNewData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [favourites, setFavourites] = useState([]); // All the favourited events, and whether or not they are selected
    const [viewFavourites, setViewFavourites] = useState(false); // Between favourites view and all events view
    const [addingFavouritesToPlan, setAddingFavouritesToPlan] = useState(false); // Selecting which favourited events to use in plan
    const [anyFavouritesClicked, setAnyFavouritesClicked] = useState(false); // Show bottom summary cart when any clicked
    const [numberOfFavouritesClicked, setNumberOfFavouritesClicked] = useState(
        0
    );
    const [
        favouriteSummaryModalVisible,
        setFavouriteSummaryModalVisibile,
    ] = useState(false); // Summary of all events in cart

    const getDataFromFirebase = async () => {
        try {
            const database = firebase.database();
            const userId = firebase.auth().currentUser.uid;
            database
                .ref("users/" + userId)
                .once("value")
                .then((snapshot) => {
                    const userData = snapshot.val();
                    const allCategories = props.allEvents; // Get all events from redux state

                    if (userData.hasOwnProperty("favourites")) {
                        const userFavourites = userData.favourites;
                        var favouritesArr = [];
                        for (var event in userFavourites) {
                            const formattedData = [
                                userFavourites[event],
                                userFavourites[event].rating,
                                false,
                            ]; // Last boolean if is adding
                            favouritesArr.push(formattedData);
                        }
                        setFavourites(favouritesArr);
                    }

                    if (Object.keys(allCategories).length !== 0) {
                        // Check that event has already been loaded from redux state
                        const data = handleEventsOf(
                            allCategories,
                            userData.preferences
                        );
                        setWhatsPopularData(data[0]);
                        setHungryData(data[1]);
                        setSomethingNewData(data[2]);
                        setIsLoading(false);
                    }
                });
        } catch (err) {
            console.log("Error getting data from firebase: ", err);
            getDataForFirstTimeUsers();
        }
    };

    // First time users has no preference history, and no favourited events
    const getDataForFirstTimeUsers = async () => {
        try {
            const database = firebase.database();
            database
                .ref("events")
                .once("value")
                .then((snapshot) => {
                    const allCategories = snapshot.val();

                    // Check that event has already been loaded from redux state
                    if (Object.keys(allCategories).length !== 0) {
                        const data = handleEventsOf(
                            allCategories,
                            undefined // No preferences yet
                        );
                        setWhatsPopularData(data[0]);
                        setHungryData(data[1]);
                        setSomethingNewData(data[2]);
                        setIsLoading(false);
                    }
                });
        } catch (err) {
            console.log("Error getting data for first time users: ", err);
        }
    }

    const refreshPage = () => {
        setIsRefreshing(true);
        getDataFromFirebase();
        setIsRefreshing(false);
    };

    // Add entire event into user's firebase node under favourites
    const handleAddToFavourites = (event, sectionTitle, index, foodIndex) => {
        var updates = {};
        var eventWithRating = event[0];
        eventWithRating.rating = event[1];
        eventWithRating.votes = 0; // For use in collaboration board

        // Visual cue to users, add heart to card
        if (sectionTitle == "Hungry?") {
            var newData = hungryData[index][foodIndex];
            newData[0].favourited = !newData[0].favourited; // Mark as favourited
            var finalData = [...hungryData[index]];
            finalData[foodIndex] = newData;
            setHungryData([[...finalData]]);
            eventWithRating.favourited = newData[0].favourited // For Firebase update
        } else if (sectionTitle == "Find something new") {
            var newData = somethingNewData[index];
            newData[0].favourited = !newData[0].favourited; // Mark as favourited
            var finalData = [...somethingNewData];
            finalData[index] = newData;
            setSomethingNewData([...finalData]);
            eventWithRating.favourited = newData[0].favourited // For Firebase update
        } else {
            // What is popular
            var newData = [...whatsPopularData[index]];
            newData[0].favourited = !newData[0].favourited; // Mark as favourited
            var finalData = [...whatsPopularData];
            finalData[index] = newData;
            setWhatsPopularData([...finalData]);
            eventWithRating.favourited = newData[0].favourited // For Firebase update
        }

        if (eventWithRating.favourited) {
            updates["/favourites/" + event[0].id] = eventWithRating; // add

            // Add to component state, so no need to pull data from Firebase
            var additionalEvent = [];
            additionalEvent[0] = eventWithRating; // Entire event object
            additionalEvent[1] = event[1]; // Rating of event
            additionalEvent[2] = false; // Selected or not
            setFavourites([...favourites, additionalEvent]);
        } else {
            updates["/favourites/" + event[0].id] = null; // remove
            var newState = [...favourites];
            newState = newState.filter(currEvent => currEvent[0].id != event[0].id);
            setFavourites(newState);
        }
        // Update Firebase
        firebase
            .database()
            .ref("/users/" + props.userID)
            .update(updates);

    };

    const handleDoneSelectingFavourites = () => {
        var allEvents = [];
        favourites.forEach((event) => {
            // Include all events selected
            const shouldEventBeAdded = event[2];
            if (shouldEventBeAdded) {
                allEvents.push(event);
            }
        });

        Alert.alert(
            "Add to plan",
            "Where would you like to include all the selected favourite events?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                {
                    text: "Ongoing collaboration",
                    onPress: () => handleAddFavouriteToCollab(allEvents),
                },
                {
                    text: "Start a new plan",
                    onPress: () => handleAddFavouriteToPersonal(allEvents),
                },
            ],
            { cancelable: true }
        );
    };

    const resetAddingFavourites = () => {
        // If any favourites selected, unselect them.
        var newState = [...favourites];
        newState.forEach((event) => {
            event[2] = false; // Unselect
        });
        setNumberOfFavouritesClicked(0);
        setAnyFavouritesClicked(false);
        setFavouriteSummaryModalVisibile(false);
        setAddingFavouritesToPlan(false);
    };

    // Summary cart shows all the favourite events that have been selected to use in planning
    const addToSummaryCart = (event, isEventIncluded) => {
        var anyEventSelected = false;
        var noOfFavsClicked = 0;
        favourites.forEach((selectedEvent) => {
            const eventIsSelected = selectedEvent[2];
            if (eventIsSelected) {
                noOfFavsClicked += 1;
                anyEventSelected = true;
            }
        });
        setNumberOfFavouritesClicked(noOfFavsClicked);
        setAnyFavouritesClicked(anyEventSelected);
    };

    // Toggle for whether or not event will be included in planning when adding to plan
    const handleFavouriteEventPress = (event, index) => {
        var newState = [...favourites];
        // Maximum number clicked and attempting to add a fourth event
        if (numberOfFavouritesClicked == 3 && newState[index][2] == false)
            return;

        newState[index][2] = !newState[index][2];
        addToSummaryCart(event, newState[index][2]);
        setFavourites(newState);
    };

    // Functionality of remove button in summary cart
    const removeSelectedFavourite = (eventID) => {
        var newState = [...favourites];
        for (var i = 0; i < newState.length; i++) {
            const currEventID = newState[i][0].id;
            if (currEventID == eventID) {
                newState[i][2] = false; // Unselect
            }
        }
        setFavourites(newState);
        if (numberOfFavouritesClicked - 1 == 0) {
            // No more favourites clicked, close modals
            setFavouriteSummaryModalVisibile(false);
            setAnyFavouritesClicked(false);
        }
        setNumberOfFavouritesClicked(numberOfFavouritesClicked - 1);
    };

    const handleAddFavouriteToCollab = (allEvents) => {
        props.setAddingFavouritesToExistsingBoard(true); // Mark redux state before navigating
        props.addFavouritesToPlan(allEvents);
        props.navigation.navigate("Plan");
        setViewFavourites(false);
        setAddingFavouritesToPlan(false);
    };

    const handleAddFavouriteToPersonal = (allEvents) => {
        props.setAddingFavourites(true); // Update redux state before navigating
        props.addFavouritesToPlan(allEvents);
        props.navigation.navigate("Plan");
        setViewFavourites(false);
        setAddingFavouritesToPlan(false);
    };

    const handleRemoveFavourites = (event, index) => {
        // Remove from Firebase
        firebase
            .database()
            .ref("/users/" + props.userID + "/favourites/" + event[0].id)
            .remove();

        // Remove from component state
        var newFavourites = [...favourites];
        newFavourites = newFavourites.filter(
            (selectedEvent) => selectedEvent[0].id != event[0].id
        );
        setFavourites(newFavourites);
    };

    const checkIfEventIsFavourited = (event) => {
        var isEventFavourited = false;
        favourites.forEach((selectedEvent) => {
            const favouritedEventID = selectedEvent[0].id;
            if (favouritedEventID == event[0].id) {
                isEventFavourited = true;
            }
        });

        return event[0].favourited || isEventFavourited;
    };

    // Takes in indivdual event array and inject it to <Card>, for vertical views
    const renderEventCard = (
        event,
        isEventFood,
        sectionTitle,
        index,
        foodIndex
    ) => {
        const isEventBeingAddedToPlan = event[2];

        var isEventFavourited = false; // Separate variable as .favourited property dont exist
        if (checkIfEventIsFavourited(event)) {
            isEventFavourited = true;
        }

        const renderTruncatedFooter = (handlePress) => {
            return (
                <Text
                    style={{
                        color: "#595959",
                        marginVertical: 5,
                    }}
                    onPress={handlePress}
                >
                    Read more
                </Text>
            );
        };

        const renderRevealedFooter = (handlePress) => {
            return (
                <Text
                    style={{
                        color: "#595959",
                        marginVertical: 5,
                    }}
                    onPress={handlePress}
                >
                    Show less
                </Text>
            );
        };

        var imageURI = event[0].imageURL;
        const eventRatings = event[1] + "/5";

        // If imageURI is a code, convert it to URI using TIH API
        if (imageURI.substring(0, 5) != "https") {
            imageURI =
                "https://tih-api.stb.gov.sg/media/v1/download/uuid/" +
                imageURI +
                "?apikey=" +
                TIH_API_KEY;
        }

        return (
            <View>
                <View
                    style={{
                        flex: 1,
                        width: Dimensions.get("window").width,
                        //marginHorizontal: 20,
                        marginVertical: 20,
                        backgroundColor: "white",
                        //borderRadius: 12,
                        elevation: 5,
                    }}
                >
                    <Image
                        source={{ uri: imageURI }}
                        style={{
                            height: isEventFood ? 100 : 210,
                            width: "100%",
                            //borderTopRightRadius: 12,
                            //borderTopLeftRadius: 12,
                        }}
                    />

                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            //marginTop: 10,
                            paddingTop: 20,
                            paddingHorizontal: 10,
                            borderTopWidth: 0.5,
                        }}
                    >
                        {event[0].title}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 10,
                            marginBottom: 10,
                        }}
                    >
                        <View style={{ flexDirection: "row" }}>
                            <MaterialCommunityIcons
                                name="star"
                                color={"#1d3557"}
                                size={24}
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: "#1d3557",
                                    marginTop: 2,
                                }}
                            >
                                {" "}
                                {eventRatings}
                            </Text>
                        </View>
                        <TouchableOpacity
                            disabled={sectionTitle == "favourites"}
                            onPress={() =>
                                handleAddToFavourites(
                                    event,
                                    sectionTitle,
                                    index,
                                    foodIndex
                                )
                            }
                        >
                            {isEventFavourited ? (
                                <MaterialCommunityIcons
                                    name="heart"
                                    color={"#e63946"}
                                    size={24}
                                />
                            ) : (
                                    <MaterialCommunityIcons
                                        name="heart-outline"
                                        color={"black"}
                                        size={24}
                                    />
                                )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginLeft: 10 }}>
                        <ReadMore
                            numberOfLines={1}
                            renderTruncatedFooter={renderTruncatedFooter}
                            renderRevealedFooter={renderRevealedFooter}
                        >
                            <Text
                                style={{
                                    marginHorizontal: 10,
                                    marginVertical: 5,
                                    fontSize: 16,
                                }}
                            >
                                {event[0].description}
                                {"\n"}
                            </Text>
                        </ReadMore>
                    </View>

                    {sectionTitle == "favourites" ? (
                        addingFavouritesToPlan ? (
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 25,
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.favouritesButton}
                                    onPress={() =>
                                        handleRemoveFavourites(event, index)
                                    }
                                >
                                    <Text style={styles.favouritesButtonText}>
                                        REMOVE FROM FAVOURITES
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.favouritesButton}
                                    onPress={() =>
                                        handleFavouriteEventPress(event, index)
                                    }
                                >
                                    <Text style={styles.favouritesButtonText}>
                                        {isEventBeingAddedToPlan
                                            ? "ADDED"
                                            : "ADD TO PLAN"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginTop: 5,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.favouritesButton}
                                        onPress={() =>
                                            handleRemoveFavourites(event)
                                        }
                                    >
                                        <Text style={styles.favouritesButtonText}>
                                            REMOVE FROM FAVOURITES
                                    </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                    ) : null}
                </View>
            </View>
        );
    };

    /**
     * Horizontal <FlatList> for food choices
     * @param {*} event is a 2D array of [[{eventDetails}, ratings], ...]
     */
    const formatFoodArray = (allEvents, sectionTitle, sectionIndex) => {
        return (
            <FlatList
                data={allEvents}
                horizontal={true}
                renderItem={
                    ({ item, index }) =>
                        renderEventCard(
                            item,
                            true,
                            sectionTitle,
                            sectionIndex,
                            index
                        ) // Food index is the inner flatlist index for food list
                }
                keyExtractor={(item, index) => item + index}
            />
        );
    };

    const renderFeed = (item, section, index) => {
        if (section.title == "Hungry?") {
            // Render eateries
            return formatFoodArray(item, section.title, index);
        }
        return renderEventCard(item, false, section.title, index); // not food
    };

    const scroll = (sectionIndex, itemIndex) => {
        sectionListRef.scrollToLocation({
            sectionIndex: sectionIndex,
            itemIndex: itemIndex,
            viewPosition: 0,
            viewOffSet: 10,
        });
    };

    const CategoryTitleText = ({ text }) => {
        return <Text style={styles.CategoryTitleText}>{text}</Text>;
    };

    const renderListHeaderComponent = (isFavouritesHeader) => {
        return (
            <View style={styles.header}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Text style={styles.headerText}>
                        {isFavouritesHeader
                            ? "Plan something!"
                            : "Welcome to DoWhat"}
                    </Text>
                    {isFavouritesHeader ? null : (
                        <TouchableOpacity onPress={signOut}>
                            <Text
                                style={{
                                    color: "grey",
                                    textDecorationLine: "underline",
                                    marginRight: 5,
                                    marginTop: 50,
                                }}
                            >
                                Sign out
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* <Text style={{ marginLeft: 10 }}>Your Favourited Events</Text>
                <View style={{ marginVertical: 30 }}>
                    <Text
                        style={{
                            marginLeft: Dimensions.get("window").width / 4,
                            fontWeight: "bold",
                            fontSize: 20,
                        }}
                    >
                        Nothing Selected Yet
                    </Text>
                </View> */}
                <Text
                    style={{
                        marginTop: 0,
                        marginBottom: 20,
                        fontWeight: "bold",
                        marginLeft: 10,
                        fontSize: 16,
                        color: "gray",
                    }}
                >
                    Browse Categories
                </Text>
                {isFavouritesHeader ? (
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-around",
                            marginTop: 5,
                        }}
                    >
                        <View
                            style={{
                                flex: 2.5,
                                flexDirection: "row",
                                justifyContent: "space-around",
                            }}
                        >
                            <View>
                                <TouchableOpacity
                                    onPress={() => setViewFavourites(false)}
                                    style={styles.headerCategory}
                                >
                                    <MaterialCommunityIcons
                                        name="reorder-horizontal"
                                        color={"black"}
                                        size={30}
                                    />
                                </TouchableOpacity>
                                <CategoryTitleText text="See all Events" />
                            </View>
                        </View>

                        {addingFavouritesToPlan ? (
                            <View
                                style={{
                                    flex: 1,
                                    borderLeftWidth: 1,
                                    marginLeft: 5,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => resetAddingFavourites()}
                                    style={[
                                        styles.headerCategory,
                                        {
                                            backgroundColor: "#e63946",
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="reply"
                                        color={"white"}
                                        size={30}
                                    />
                                </TouchableOpacity>
                                <CategoryTitleText text="Back" />
                            </View>
                        ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        borderLeftWidth: 1,
                                        marginLeft: 5,
                                    }}
                                >
                                    <TouchableOpacity
                                        disabled={addingFavouritesToPlan}
                                        onPress={() =>
                                            setAddingFavouritesToPlan(true)
                                        }
                                        style={[
                                            styles.headerCategory,
                                            { backgroundColor: "#ff664a" },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="animation"
                                            color={"white"}
                                            size={30}
                                        />
                                    </TouchableOpacity>
                                    <CategoryTitleText text="Plan with Favourites" />
                                </View>
                            )}
                    </View>
                ) : (
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-around",
                                marginTop: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 2.5,
                                    flexDirection: "row",
                                    justifyContent: "space-around",
                                    marginLeft: -5,
                                    marginVertical: 15,
                                }}
                            >
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFavouriteSummaryModalVisibile(false);
                                            setAddingFavouritesToPlan(false);
                                            setAnyFavouritesClicked(false);
                                            setNumberOfFavouritesClicked(0);
                                            setViewFavourites(true)
                                        }}
                                        style={[
                                            styles.headerCategory,
                                            { backgroundColor: "#ffcccc" },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="cards-heart"
                                            color={"#d00000"}
                                            size={25}
                                        />
                                    </TouchableOpacity>
                                    <CategoryTitleText text="FAVOURITES" />
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => scroll(0, 0)}
                                        style={[
                                            styles.headerCategory,
                                            { backgroundColor: "#ffffb3" },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="star"
                                            color={"#CCCC00"}
                                            size={25}
                                        />
                                    </TouchableOpacity>
                                    <CategoryTitleText text="POPULAR" />
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => scroll(1, 0)}
                                        style={[
                                            styles.headerCategory,
                                            { backgroundColor: "#f2f2f2" },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="silverware-variant"
                                            color={"#9d8189"}
                                            size={25}
                                        />
                                    </TouchableOpacity>
                                    <CategoryTitleText text="EATERIES" />
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => scroll(2, 0)}
                                        style={[
                                            styles.headerCategory,
                                            { backgroundColor: "#cce0ff" },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="city"
                                            color={"#3d5a80"}
                                            size={25}
                                        />
                                    </TouchableOpacity>
                                    <CategoryTitleText text="DISCOVER" />
                                </View>
                            </View>
                            {/* <View
                            style={{
                                flex: 1,
                                borderLeftWidth: 1,
                                marginLeft: 5,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    props.navigation.navigate("Plan", {
                                        addingFavourite: false,
                                    })
                                }
                                style={[
                                    styles.headerCategory,
                                    { backgroundColor: "#e63946" },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="feature-search"
                                    color={"white"}
                                    size={30}
                                />
                            </TouchableOpacity>
                            <CategoryTitleText text="Plan with Friends" />
                        </View> */}
                        </View>
                    )}
            </View>
        );
    };

    const signOut = () => {
        firebase.auth().signOut();
        props.navigation.navigate("Auth");
    };

    var sectionListRef = {}; // For anchor tag use

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (viewFavourites) {
        // Favourites view
        return (
            <View style={styles.container}>
                <SectionList
                    onRefresh={() => refreshPage()}
                    ref={(ref) => (sectionListRef = ref)}
                    ListHeaderComponent={() => renderListHeaderComponent(true)}
                    progressViewOffset={100}
                    refreshing={isRefreshing}
                    sections={[{ title: "My favourites", data: favourites }]}
                    renderItem={({ item, section, index }) =>
                        renderEventCard(item, false, "favourites", index, 0)
                    }
                    renderSectionHeader={({ section }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>
                                {section.title}
                            </Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => index}
                />

                {favouriteSummaryModalVisible ? ( // Modal of cart sumamry
                    <SelectedFavouritesSummaryModal
                        onClose={() => setFavouriteSummaryModalVisibile(false)}
                        allEvents={favourites}
                        removeSelectedFavourite={removeSelectedFavourite}
                    />
                ) : null}

                {anyFavouritesClicked ? (
                    <View style={{ opacity: 100 }}>
                        {favouriteSummaryModalVisible // Show opening arrow when modal is not visible 
                            ? null
                            : <Badge
                                value={
                                    <MaterialCommunityIcons
                                        name="chevron-up"
                                        color={"white"}
                                        size={28}
                                    />
                                }
                                badgeStyle={{
                                    backgroundColor: "#cc5237",
                                    paddingTop: 15,
                                    paddingBottom: 15,
                                    borderTopLeftRadius: 10,
                                    borderTopRightRadius: 10,
                                    borderWidth: 0,
                                }}
                                onPress={() =>
                                    setFavouriteSummaryModalVisibile(true)}
                                containerStyle={{
                                    position: "relative",
                                    top: 5,
                                    right: -100,
                                }}
                            />
                        }

                        {numberOfFavouritesClicked == 3 ? ( // error message when max number of events clicked
                            <Text
                                style={{
                                    position: "absolute",
                                    marginTop: 5,
                                    marginLeft: 20,
                                    color: "red",
                                    fontWeight: "600",
                                }}
                            >
                                Maximum number of events added
                            </Text>
                        ) : null}

                        <View
                            style={[styles.summaryCartBottomContainer,
                            favouriteSummaryModalVisible ? {
                                borderTopLeftRadius: 0, borderTopRightRadius: 0,
                                borderTopWidth: 0.2, borderTopColor: 'white'
                            } : {}]}
                        >
                            <Text
                                style={{
                                    textAlign: "center",
                                    color: "white",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: 14,
                                    marginTop: 3,
                                    marginLeft: 10,
                                }}
                            >
                                {numberOfFavouritesClicked} | Use events for
                                plan
                            </Text>

                            <TouchableOpacity
                                onPress={handleDoneSelectingFavourites}
                                style={{
                                    padding: 5,
                                    backgroundColor: "white",
                                    borderRadius: 5,
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="greater-than"
                                    color={"black"}
                                    size={16}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {
                    // Render empty state favourites screen
                    favourites.length == 0 ? (
                        <View style={{ flex: 20, justifyContent: "center" }}>
                            <Text
                                style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    textAlign: "center",
                                }}
                            >
                                No favourites added yet.
                            </Text>
                            <Text
                                style={{
                                    margin: 5,
                                    fontSize: 14,
                                    color: "grey",
                                    textAlign: "center",
                                }}
                            >
                                Add an event to favourites by clicking on the
                                heart in the event in the home feed.
                            </Text>
                        </View>
                    ) : null
                }
            </View>
        );
    }

    // Normal view
    return (
        <View style={styles.container}>
            <SectionList
                onRefresh={() => refreshPage()}
                ref={(ref) => (sectionListRef = ref)}
                ListHeaderComponent={() => renderListHeaderComponent(false)}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    {
                        title: "Popular",
                        data: whatsPopularData,
                    }, // eventData[0] is an array of data items
                    { title: "Hungry?", data: hungryData }, // eventData[1] is an array of one element: [data]
                    { title: "Discover", data: somethingNewData }, // eventData[2] is an array data items
                ]}
                renderItem={({ item, section, index }) =>
                    renderFeed(item, section, index)
                }
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>
                            {section.title}
                        </Text>
                    </View>
                )}
                keyExtractor={(item, index) => index}
            />
        </View>
    );
};

const mapDispatchToProps = {
    setAddingFavourites,
    addFavouritesToPlan,
    setAddingFavouritesToExistsingBoard,
};

const mapStateToProps = (state) => {
    return {
        allEvents: state.add_events.events,
        userID: state.add_events.userID,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        color: "black",
        fontSize: 26,
        marginLeft: 10,
        textShadowColor: "#e85d04",
        fontWeight: "bold",
        marginBottom: 20,
        marginTop: 80,
    },
    headerCategory: {
        //borderWidth: 0.5,
        padding: 15,
        borderRadius: 30,
        //elevation: 0.01,
        alignSelf: "center",
    },
    header: {
        backgroundColor: "white",
        elevation: 0.1,
    },
    CategoryTitleText: {
        color: "black",
        textAlign: "center",
        fontSize: 13,
        fontWeight: "bold",
        marginTop: 10,
    },
    sectionHeaderText: {
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 10,
        marginBottom: 5,
        marginTop: 10,
    },
    // sectionHeader: {
    //     marginRight: 15,
    //     marginTop: 5,
    //     borderRadius: 5,
    //     borderWidth: 0.5,
    //     borderColor: "black",
    //     //backgroundColor: "#e63946",
    // },
    cardButton: {
        borderRadius: 5,
        marginLeft: "1%",
        marginRight: "1%",
        borderWidth: 0.2,
        borderColor: "black",
        backgroundColor: "#457b9d",
    },
    moreDetailsButtonText: {
        color: "#f1faee",
        fontWeight: "300",
        textAlign: "center",
    },
    favouritesButton: {
        borderWidth: 0.1,
        padding: 5,
    },
    favouritesButtonText: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        color: "black",
    },
    modalContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
    },
    summaryCartBottomContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderRadius: 5,
        marginLeft: '5%',
        marginRight: '5%',
        backgroundColor: "#cc5327",
    }
});