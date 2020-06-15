import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, SectionList, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import firebase from '../database/firebase';
import { handleEventsOf } from '../reusable-functions/HomeFeedLogic';
import { Card, Icon } from 'react-native-elements';

const Feed = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);

    const getDataFromFirebase = () => {
        firebase
            .database()
            .ref("events")
            .once("value")
            .then((snapshot) => {
                const allCategories = snapshot.val(); // obj with events of all categories
                handleEventsOf(allCategories);

                setIsLoading(false); // Indicate that data is ready to be rendered
            })
    }

    useEffect(() => {
        getDataFromFirebase();
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


    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    } else {
        return (
            <View style={styles.container}>
                <SectionList
                    sections={[
                        { title: "What is currently popular", data: [da, da, da] },
                        { title: "Hungry?", data: [ta] },
                        { title: "Find something new", data: [da, da, da] }
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
        color: '#14213d',
    }
});