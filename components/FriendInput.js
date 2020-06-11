import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import firebase from "../database/firebase";
import { TouchableOpacity } from "react-native-gesture-handler";

/**
 * This component is a page for user to determine how many friends will be added to find the
 * common overlapping intervals of available timings.
 * User will only come to this page if and after snycing their Google Calendar.
 */
class FriendInput extends React.Component {
    shareWithTelegram = (url) => {
        // Deep linking
        Linking.openURL(
            "https://t.me/share/url?url=" +
            url +
            "&text=" +
            "\n" +
            "Here is the link to input your calendar availability!"
        );
    };

    shareWithWhatsapp = (url) => {
        Linking.openURL(
            "whatsapp://send?" +
            "text=Here is the link to input your calendar availability! " +
            "\n" +
            url)
            .catch(err => alert("Please download WhatsApp to use this feature"))
    };

    encodeUserInfoToURL = (url) => {
        const userId = "#" + firebase.auth().currentUser.uid; // Add # for marking, so can extract from web-app
        return url + encodeURIComponent(userId);
    };

    // Hosted on AWS Amplify
    DoWhatWebURL = "https://master.da00s432t0f9l.amplifyapp.com/";

    render() {
        return (
            <View style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.titleText}>Invite your friends</Text>
                </View>

                <View style={styles.body}>
                    <Image style={styles.image} source={require('../assets/FriendsHangout.png')} />
                    <Text style={styles.subtitleText}>
                        You have successfully synced your Google calendar! Now invite some of your friends to join you!
                    </Text>

                    <View style={styles.shareButtons}>
                        <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: '#0088CC', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                            onPress={() => this.shareWithTelegram(
                                this.encodeUserInfoToURL(this.DoWhatWebURL))}>
                            <Text style={{ fontSize: 11, color: 'white' }}>Share with Telegram</Text>
                        </TouchableOpacity>

                        <Text> | </Text>

                        <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: '#25D366', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                            onPress={() => this.shareWithWhatsapp(
                                this.encodeUserInfoToURL(this.DoWhatWebURL))}>
                            <Text style={{ fontSize: 11, color: 'white' }}>Share with Whatsapp</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: 'grey', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                        onPress={() => this.props.navigation.navigate("Timeline")}>
                        <Text style={{ fontSize: 11, color: 'white' }}>
                            I know my friends' schedules
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.shareWithButton, { backgroundColor: 'grey', padding: 3, paddingLeft: 10, paddingRight: 10 }]}
                        onPress={() => this.props.navigation.navigate("Genre")}>
                        <Text style={{ fontSize: 11, color: 'white' }}>
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default FriendInput;

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
