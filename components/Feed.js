import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity } from "react-native";
import firebase from '../database/firebase';
import { handleEventsOf } from '../reusable-functions/HomeFeedLogic';
import { connect } from 'react-redux';

/**
 * User feed in home page. Has 3 divisions: Show whats popular, eateries, and activities
 * that the user does not normally engage in.
 * @param {*} props 
 */
const Feed = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [eventData, setEventData] = React.useState([]);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const getDataFromFirebase = async () => {
        try {
            const database = firebase.database();
            const userId = firebase.auth().currentUser.uid;

            database.ref("users/" + userId)
                .once("value")
                .then((snapshot) => {
                    const userData = snapshot.val();
                    const allCategories = props.allEvents; // Get all events from redux state 

                    if (Object.keys(allCategories).length !== 0) { // Check that event has already been loaded from redux state
                        const data = handleEventsOf(allCategories, userData.preferences);
                        setEventData(data)
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

    useEffect(() => {
        if (isLoading) { // Prevent constant reloading when image renders
            getDataFromFirebase();
        }
    });

    const handleTitlePress = (title) => {
        if (title == 'What is currently popular') {
            alert("Hello")
        } else if (title == 'Hungry?') {
            alert("Hungry")
        } else {
            alert("Find something new")
        }
    }



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
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "What is currently popular", data: eventData[0] }, // eventData[0] is an array of <Card>
                    { title: "Hungry?", data: eventData[1] }, // eventData[1] is an array of one element: [<Flatlist>]
                    { title: "Find something new", data: eventData[2] } // eventData[2] is an array of <Card>
                ]}
                renderItem={({ item }) => item}
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
        allEvents: state.add_events.events
    };
};

export default connect(mapStateToProps, null)(Feed);

const styles = StyleSheet.create({
    container: {
        marginTop: '2%',
        flex: 1,
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

    }
});