import React, { useEffect, useState } from "react";
import { Image, View, Text, StyleSheet, Modal } from "react-native";
import * as Linking from "expo-linking";
import firebase from "../database/firebase";
import { TouchableOpacity } from "react-native-gesture-handler";
import { connect } from 'react-redux';
import FriendInputModal from './FriendInputModal';

/**
 * This component is a page for user to determine how many friends will be added to find the
 * common overlapping intervals of available timings.
 * User will only come to this page if and after snycing their Google Calendar.
 */
const FriendInput = (props) => {
    useEffect(() => {
        addDatabaseToState();
    }, []);

    const [modalVisible, setModalVisible] = useState(false);
    const [database, setDatabase] = useState({})

    const addDatabaseToState = () => {
        firebase.database()
            .ref()
            .once("value")
            .then((snapshot) => {
                const database = snapshot.val();
                setDatabase(database); // Add to component state for future checks if invitation alr sent
            })
    }

    const closeModal = () => {
        setModalVisible(false);
    }

    const formatLinkToAppURL = (url) => {
        const httpAppended = 'https' + url.substring(3)
        const indexAdded = httpAppended.replace('?', '/index.exp?')
        return indexAdded;
    }

    const shareWithTelegram = (url) => {
        // Deep linking
        Linking.openURL(
            "https://t.me/share/url?url=" +
            url +
            "&text=" +
            "\n" +
            "Here is the link to input your calendar availability!" +
            "\n\n" +
            "Otherwise, use this link if you already have DoWhat on your phone!" +
            "\n" +
            formatLinkToAppURL(Linking.makeUrl('', { inviterUID: props.userID })) // Include link to DoWhat mobile app
        );
    };

    const shareWithWhatsapp = (url) => {
        Linking.openURL(
            "whatsapp://send?" +
            "text=Here is the link to input your calendar availability! " +
            "\n" +
            url +
            "\n\n" +
            "Otherwise, use this link if you already have DoWhat on your phone!" +
            "\n" +
            formatLinkToAppURL(Linking.makeUrl('', { inviterUID: props.userID })) // Including link to DoWhat mobile app
        )
            .catch(err => alert("Please download WhatsApp to use this feature"))
    };

    const encodeUserInfoToURL = (url) => {
        const userId = "#" + firebase.auth().currentUser.uid; // Add # for marking, so can extract from web-app
        return url + encodeURIComponent(userId);
    };

    // Hosted on AWS Amplify
    const DoWhatWebURL = "https://master.da00s432t0f9l.amplifyapp.com/";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titleText}>Invite your friends</Text>
            </View>

            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}>
                <FriendInputModal onClose={closeModal} database={database} />
            </Modal>

            <View style={styles.body}>
                <Image style={styles.image} source={require('../assets/FriendsHangout.png')} />
                <Text style={styles.subtitleText}>
                    You have successfully synced your Google calendar! Now invite some of your friends to join you!
                    </Text>

                <View style={styles.shareButtons}>
                    <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: '#0088CC', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                        onPress={() => shareWithTelegram(
                            encodeUserInfoToURL(DoWhatWebURL))}>
                        <Text style={{ fontSize: 11, color: 'white' }}>Share with Telegram</Text>
                    </TouchableOpacity>

                    <Text> | </Text>

                    <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: '#25D366', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                        onPress={() => shareWithWhatsapp(
                            encodeUserInfoToURL(DoWhatWebURL))}>
                        <Text style={{ fontSize: 11, color: 'white' }}>Share with Whatsapp</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.shareWithButton, { marginTop: 10, backgroundColor: 'grey', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                    onPress={() => setModalVisible(true)}>
                    <Text style={{ fontSize: 11, color: 'white' }}>
                        Invite friends from DoWhat
                        </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: 'grey', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                    onPress={() => props.navigation.navigate("Timeline")}>
                    <Text style={{ fontSize: 11, color: 'white' }}>
                        I know my friends' schedules
                        </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: 'grey', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                    onPress={() => props.navigation.navigate("Genre", { route: "link" })}>
                    <Text style={{ fontSize: 11, color: 'white' }}>
                        Done
                        </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const mapStateToProps = (state) => {
    console.log("State is:", state.add_events.userID);
    return {
        userID: state.add_events.userID
    };
};

export default connect(mapStateToProps, null)(FriendInput);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
        marginTop: '10%',
    },
    body: {
        flex: 3,
        alignContent: 'center',
        alignItems: 'center',
        margin: '5%',
    },
    footer: {
        flex: 1,
        flexDirection: 'column',
        margin: '5%',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    titleText: {
        fontFamily: 'serif',
        fontSize: 25,
        fontWeight: '600',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 0.5,
        borderColor: 'black'
    },
    subtitleText: {
        fontSize: 12,
        fontFamily: 'serif',
        color: 'grey',
        textAlign: 'center',
        marginTop: 20

    },
    shareButtons: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: 'space-around',
        width: '100%',
    },
    shareWithButton: {
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: 'black',
        paddingLeft: 3,
        paddingRight: 3,
    },
});
