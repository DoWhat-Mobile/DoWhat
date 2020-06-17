import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Dimensions, SectionList, Image } from "react-native";
import { Card } from 'react-native-elements';
import firebase from '../../database/firebase';

const AllFriends = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [allFriends, setAllFriends] = React.useState([]);

    // Not functional yet
    const refreshPage = () => {
        setIsRefreshing(true);
        setIsRefreshing(false);
    }

    const findFriends = () => {
        firebase.database()
            .ref("users")
            .once("value")
            .then((snapshot) => {
                const allAppUsers = snapshot.val();
                renderToView(allAppUsers);
            })
    }

    const sendPushNotification = async () => {
        const message = {
            to: 'ExponentPushToken[BExy8rJa3lJttXdBqiNtoU]', // Automate this
            sound: 'default',
            title: 'Original Title',
            body: 'And here is the body!',
            data: { data: 'goes here' },
            _displayInForeground: true,
        };
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }

    const renderToView = async (allAppUsers) => {
        // Format for use in <SectionList>
        const injectReact = (user) => {
            return (
                <View style={{ width: Dimensions.get('window').width }}>
                    <Card
                        style={{ height: (Dimensions.get('window').height / 2) }}
                        title={user.first_name}
                    >
                        <Image
                            source={{ uri: user.profile_picture_url }}
                            style={{ height: 50, width: 50, borderRadius: 100 }}
                        />
                        <Button title="+" onPress={() => sendPushNotification()} />
                    </Card>
                </View>
            );
        }
        var moreUsers = [];
        for (var userID in allAppUsers) { // Find all users in database (This doesnt scale well with size...)
            console.log(userID);
            const user = allAppUsers[userID];
            const formattedUser = injectReact(user);
            moreUsers.push(formattedUser)
        }
        setAllFriends([...allFriends, ...moreUsers]);
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <SectionList
                onRefresh={() => refreshPage()}
                progressViewOffset={100}
                refreshing={isRefreshing}
                sections={[
                    { title: "", data: allFriends },
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
            <Button onPress={() => findFriends()} title="Find Friends" />
        </View>
    );
}

export default AllFriends;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: 'center',

    },
    headerText: {
        textAlign: 'center',
        fontWeight: '800',
        fontSize: 20,
    },
    body: {
        flex: 7,
        justifyContent: 'center',
    },
    footer: {
        flex: 1,
    },
});