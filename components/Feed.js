import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, SectionList, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import firebase from '../database/firebase';
import { handleEventsOf } from '../reusable-functions/HomeFeedLogic';
import { Card, Icon } from 'react-native-elements';

const Feed = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [eventData, setEventData] = React.useState([]);

    // Data to be rendered in the feed
    const popularArray = [da, da, da, da, da];
    const foodArray = [da, da, da, da, da];

    const da =
        <Card
            title='HELLO WORLD'
            image={require('../assets/FriendsHangout.png')}>
            <Text style={{ marginBottom: 10 }}>
                The idea with React Native Elements is more about component structure than actual design.
            </Text>
            <Button
                icon={<Icon name='code' color='#ffffff' />}
                buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                title='VIEW NOW' />
        </Card>

    const ta =
        <FlatList
            data={[da, da, da]}
            horizontal={true}
            renderItem={({ item }) => (
                item
            )}
            keyExtractor={item => item.title}
        />

    // var eventData = []; // [[da, da], [ta], [da, da]];

    const getDataFromFirebase = () => {
        firebase
            .database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                const allCategories = snapshot.val(); // obj with events of all categories
                setEventData(handleEventsOf(allCategories));
                setIsLoading(false);
            })
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
                sections={[
                    { title: "What is currently popular", data: eventData[0] }, // eventData[0] is an array of <Card>
                    { title: "Hungry?", data: eventData[1] }, // eventData[1] is an array of one element: [<Flatlist>]
                    { title: "Find something new", data: eventData[0] } // eventData[2] is an array of <Card>
                ]}
                renderItem={({ item }) => item}
                renderSectionHeader={({ section }) =>
                    <TouchableOpacity onPress={() => handleTitlePress(section.title)}>
                        <Text style={styles.sectionHeader}>{section.title}</Text>
                    </TouchableOpacity>
                }
                keyExtractor={(item, index) => index}
            />
        </View >
    );
}

export default Feed;

const styles = StyleSheet.create({
    container: {
        marginTop: '2%',
        flex: 1,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'serif',
        color: 'red',
    }
});