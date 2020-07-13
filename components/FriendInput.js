import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, View, Text, StyleSheet, Modal } from "react-native";
import * as Linking from "expo-linking";
import firebase from "../database/firebase";
import { TouchableOpacity } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { formatDateToString } from '../reusable-functions/GoogleCalendarGetBusyPeriods';
import FriendsDisplay from "./FriendsDisplay";

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
    const [database, setDatabase] = useState({});

    const addDatabaseToState = () => {
        firebase
            .database()
            .ref()
            .once("value")
            .then((snapshot) => {
                const database = snapshot.val();
                setDatabase(database); // Add to component state for future checks if invitation alr sent
            });
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const shareWithTelegram = (url) => {
        // Deep linking
        Linking.openURL(
            "https://t.me/share/url?url=" +
            url +
            "&text=" +
            "\n" +
            "Hey! Let's hang out! Use this link to input your availability!"
        );
    };

    const shareWithWhatsapp = (url) => {
        Linking.openURL(
            "whatsapp://send?" +
            "text=Hey! Let's hang out! Use this link to input your availability!" +
            "\n" +
            url
        ).catch((err) => alert("Please download WhatsApp to use this feature"));
    };

    const encodeUserInfoToURL = (url) => {
        const userId = "#" + firebase.auth().currentUser.uid; // Add # for marking, so can extract from web-app
        return url + encodeURIComponent(userId);
    };

    // Hosted on AWS Amplify
    const DoWhatWebURL = "https://master.da00s432t0f9l.amplifyapp.com/";

    if (props.route.params.route == 'collab') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>Invite your friends</Text>
                </View>

                <View style={styles.body}>
                    <Image
                        style={styles.image}
                        source={require("../assets/FriendsHangout.png")}
                    />
                    <Text style={styles.subtitleText}>
                        You have chosen your date and inputted your availabilities,
                        now it's time to invite some of your friends to join you!
                </Text>
                </View>

                <View style={{ flex: 5, margin: 10 }}>
                    <FriendsDisplay
                        onClose={closeModal}
                        database={database}
                        navigation={props.navigation}
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.shareWithButton,
                            {
                                marginTop: 10,
                                backgroundColor: "#cc5327",
                                padding: 10,
                                paddingLeft: 25,
                                paddingRight: 25,
                            },
                        ]}
                        onPress={() => props.navigation.navigate('Plan', { addingFavourite: false })}
                    >
                        <Text style={{ fontSize: 16, color: "white" }}>
                            DONE
                    </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );

    } else { // Invite friends without DoWhat app
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>Invite your friends</Text>
                </View>
                <View style={styles.body}>
                    <Image
                        style={styles.image}
                        source={require("../assets/FriendsHangout.png")}
                    />
                    <Text style={styles.subtitleText}>
                        You have chosen your date and inputted your availabilities,
                        now invite your friends to enter their availabilities as well!
                </Text>

                    <View style={styles.shareButtons}>
                        <TouchableOpacity
                            style={[
                                styles.shareWithButton,
                                {
                                    backgroundColor: "#0088CC",
                                    paddingRight: 5,
                                    paddingLeft: 5
                                },
                            ]}
                            onPress={() =>
                                shareWithTelegram(encodeUserInfoToURL(DoWhatWebURL))
                            }
                        >
                            <MaterialCommunityIcons
                                name="send-circle"
                                color={"white"}
                                size={20}
                            />
                            <Text style={{ color: 'white' }}>Telegram Invite</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.shareWithButton,
                                {
                                    backgroundColor: "#25D366",
                                    paddingRight: 5,
                                    paddingLeft: 5,
                                },
                            ]}
                            onPress={() =>
                                shareWithWhatsapp(encodeUserInfoToURL(DoWhatWebURL))
                            }
                        >
                            <MaterialCommunityIcons
                                name="whatsapp"
                                color={"white"}
                                size={20}
                            />
                            <Text style={{ color: 'white' }}>Whatsapp Invite</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.shareWithButton,
                            {
                                marginTop: 10,
                                backgroundColor: "#cc5327",
                                padding: 10,
                                paddingLeft: 25,
                                paddingRight: 25,
                            },
                        ]}
                        onPress={() =>
                            props.navigation.navigate("Loading", { route: "link", access: 'host' })
                        }
                    >
                        <Text style={{ fontSize: 16, color: "white" }}>
                            Done Inviting
                    </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
};

const mapStateToProps = (state) => {
    const dateInString = formatDateToString(state.date_select.date);
    return {
        userID: state.add_events.userID,
        selected_date: dateInString,
    };
};

export default connect(mapStateToProps, null)(FriendInput);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        alignContent: "center",
        alignItems: "center",
        marginTop: "10%",
    },
    body: {
        flex: 5,
        alignContent: "center",
        alignItems: "center",
        marginTop: 0,
        margin: "5%",
    },
    footer: {
        flex: 2,
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "space-around",
    },
    titleText: {
        fontFamily: "serif",
        fontSize: 25,
        fontWeight: "600",
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 0.5,
        borderColor: "black",
    },
    subtitleText: {
        fontSize: 12,
        fontFamily: "serif",
        color: "grey",
        textAlign: "center",
        marginTop: 20,
    },
    shareButtons: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "space-around",
        width: "100%",
    },
    shareWithButton: {
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: "black",
        padding: 4,
        flexDirection: 'row'
    },
});
