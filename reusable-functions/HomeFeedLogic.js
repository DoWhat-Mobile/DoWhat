/**
 * This file stores the logic for sorting and formatting events from the Firebase DB
 * to a React view.
 */
import React from 'react';
import { TIH_API_KEY } from 'react-native-dotenv';
import { Card, Icon } from 'react-native-elements';
import { Button, Text, View } from 'react-native';

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

// Takes in indivdual event array and inject into <Card>
const injectReactElementTo = (event) => {
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

    return result; // Contains more popular food options of different categories
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
 * Popularity is determined by using the ratings as a metric 
 * @param {} allCategories 
 */
const getPopularEvents = (allCategories) => {

}

export const handleEventsOf = (allCategories) => {
    // Array of 5 more popular eateries
    const topFoodEvents = getTopEateries(allCategories.restaurants,
        allCategories.hawker, allCategories.cafes);

    const newEvents = findSomethingNew(allCategories);

    const popularEvents = getPopularEvents(allCategories);

    return [topFoodEvents, newEvents, popularEvents];
}