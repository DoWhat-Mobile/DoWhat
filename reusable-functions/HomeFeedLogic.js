/**
 * This file stores the logic for sorting and formatting events from the Firebase DB
 * to a React view.
 */
import React from 'react';
import { TIH_API_KEY } from 'react-native-dotenv';
import { Card, Icon } from 'react-native-elements';
import { Button, Text, View, FlatList } from 'react-native';
import { render } from 'react-dom';

/**
 * Sort events by decreasing order of ratings 
 * @param {*} allEventsObject is an object from Firebase events node, object
 * has the following props: duration, list, slots
 */
const sortEventsByRatings = (allEventsObject) => {
    const eventsList = allEventsObject.list;
    var sortable = []; //2D Array to be used for sorting by ratings
    var count = 0;

    for (var prop in eventsList) {
        if (count == 5) break; // We only take top 5 events

        const currEvent = eventsList[prop];
        sortable.push([{
            title: currEvent.name,
            description: currEvent.description,
            imageURL: currEvent.image,
            location: currEvent.location,
            selected: false // To prevent duplicates when selecting 
        }, currEvent.rating])
        count++;
    }

    // Ratings stored in index '1' of each inner array 
    sortable.sort((x, y) => {
        return y[1] - x[1];
    })
    return sortable;
}

// Min and max included. 
const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Run through entire array and returns another array of the data 
 * injected with React elements. 
 * @param {*} event is an ARRAY of [{}, rating] 
 * @param {*} injectReactToEach is a function specifying how each element in the list view
 *  will be styled.
 */
const injectReactToAll = (event, injectReactToEach) => {
    var eventsInReactElement = [];
    for (var i = 0; i < event.length; i++) {
        eventsInReactElement.push(injectReactToEach(event[i]));
    }
    // Returns an ARRAY of styled elements
    return eventsInReactElement;
}

// Takes in indivdual event array and inject it to <Card>, for vertical views 
const renderWhatsPopular = (event) => {
    var imageURI = event[0].imageURL;

    // If imageURI is a code, convert it to URI using TIH API
    if (imageURI.substring(0, 5) != 'https') {
        imageURI = 'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
            imageURI + '?apikey=' + TIH_API_KEY;
    }

    return (
        <Card
            title={event[0].title}
            image={{ uri: imageURI }}>
            <Text style={{ marginBottom: 10 }}>
                {event[0].description}
            </Text>
            <Button
                icon={<Icon name='code' color='#ffffff' />}
                buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                title='VIEW NOW' />
        </Card>
    );
}

// Styling to be rendered for food selection in Home screen feed
const renderFoodChoices = (events) => {
    var imageURI = event[0].imageURL;

    // If imageURI is a code, convert it to URI using TIH API
    if (imageURI.substring(0, 5) != 'https') {
        imageURI = 'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
            imageURI + '?apikey=' + TIH_API_KEY;
    }

    return (
        <Card
            title={event[0].title}
            image={{ uri: imageURI }}>
            <Text style={{ marginBottom: 10 }}>
                {event[0].description}
            </Text>
            <Button
                icon={<Icon name='code' color='#ffffff' />}
                buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                title='VIEW NOW' />
        </Card>
    );
}

// Horizontal <FlatList> for food choices
const formatFoodArray = (event) => {
    return (
        <FlatList
            data={injectReactToAll(event, renderFoodChoices)}
            horizontal={true}
            renderItem={({ item }) => (
                item
            )}
            keyExtractor={item => item.title}
        />
    )
}

/**
 * Selects the top 5 out of the 3 food categories. Randomised.
 * @param {*} restaurants 
 * @param {*} hawkers 
 * @param {*} cafes 
 */
const getTopEateries = (restaurants, hawkers, cafes) => {
    // 2D array of [{}, rating]
    const topRestaurants = sortEventsByRatings(restaurants);
    const topHawkers = sortEventsByRatings(hawkers);
    const topCafes = sortEventsByRatings(cafes);

    const selections = [topRestaurants, topHawkers, topCafes];
    var result = [];

    for (var i = 0; i < 5; i++) {
        const j = randomIntFromInterval(0, 2);
        const k = randomIntFromInterval(0, 4);

        const category = selections[j]; // Randomly selected category
        var eatery = category[k]; // One of top 5 (since 0 <= k <= 4)

        if (eatery.selected) { // Selected eatery is unique
            selections[j][k].selected = true; // Mark as selected so we dont have duplicates

        } else { // If selected, reselect another option
            const a = randomIntFromInterval(0, 4);
            eatery = category[a]; // HIGHLY unlikely that even after reselect, still duplicate, though its possible.
            selections[j][a].selected = true; // Mark as selected so we dont have duplicates

        }

        result.push(eatery);
    }
    const final = formatFoodArray(result);
    return [final]; // Contains more popular food options of different categories, array format for compatibility with SectionList
}

/**
 * This algo can be used to recommend events to users that they don't normally
 * select, to encourage users to try something new. It requires data of what users
 * normally select. 
 * So NEW events are unique to each user. For example if a user often selects chill,
 * we will recommend adventure activities from here.
 * @param {} allCategories 
 */
const findSomethingNew = (allCategories) => {

}

/**
 * Popularity is determined by using the ratings as a metric. This does not include eateries. 
 * @param {} allCategories 
 */
const getPopularEvents = (allCategories) => {
    const topAdventures = sortEventsByRatings(allCategories.adventure)
    const topArts = sortEventsByRatings(allCategories.arts)
    const topLeisure = sortEventsByRatings(allCategories.leisure)
    const topNature = sortEventsByRatings(allCategories.nature)
    const topNightlife = sortEventsByRatings(allCategories.nightlife)

    const selections = [topAdventures, topArts, topLeisure, topNature, topNightlife]
    var result = [];

    for (var i = 0; i < 5; i++) {
        const j = randomIntFromInterval(0, 4);
        const k = randomIntFromInterval(0, 4);

        const category = selections[j]; // Randomly selected category
        var event = category[k]; // One of top 5 (since 0 <= k <= 4)

        if (event.selected) { // Selected eatery is unique
            selections[j][k].selected = true; // Mark as selected so we dont have duplicates

        } else { // If selected, reselect another option
            const a = randomIntFromInterval(0, 4);
            event = category[a]; // HIGHLY unlikely that even after reselect, still duplicate, though its possible.
            selections[j][a].selected = true; // Mark as selected so we dont have duplicates

        }
        result.push(event);
    }
    const final = injectReactToAll(result, renderWhatsPopular);
    return final; // Contains more popular food options of different categories
}

/**
 * Takes events from all categories, and extracts relavant data to create 3 components:
 * What is currently popular, Top eateries, and lastly new events that user is not usually
 * exposed to.
 * @param {*} allCategories events from all categories 
 */
export const handleEventsOf = (allCategories) => {
    const popularEvents = getPopularEvents(allCategories);

    // Array of 5 more popular eateries
    const topFoodEvents = getTopEateries(allCategories.restaurants,
        allCategories.hawker, allCategories.cafes);

    const newEvents = findSomethingNew(allCategories);

    // Array of data already formatted for SectionList data input
    return [popularEvents, topFoodEvents, popularEvents];
}