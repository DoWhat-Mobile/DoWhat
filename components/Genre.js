import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import PickerModal from "./PickerModal";
import { connect } from "react-redux";
import * as actions from "../actions";
import { findOverlappingIntervals } from "../reusable-functions/OverlappingIntervals";
import firebase from "../database/firebase";

// might use tab navigator and define a static property
const Genre = (props) => {
    const [visible, setVisible] = React.useState(false);
    const [selected, setSelected] = React.useState([]);
    const [dining, setDining] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const genreType = ["adventure", "arts", "leisure", "nature", "nightlife"];
    const finalized = [];

    const [freeTime, setFreeTime] = React.useState([]);
    const manual = props.route.params.route;

    /**
     * Get data from firebase and initiate algo to find overlapping time intervals.
     */
    React.useEffect(() => {
        const userId = firebase.auth().currentUser.uid; //Firebase UID of current user
        firebase
            .database()
            .ref("users/" + userId)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                const allAttendees = userData.all_attendees; // Undefined if no friends synced their Gcal
                const mainUserBusyPeriod = userData.busy_periods;
                const finalizedTimeRange = findOverlappingIntervals(
                    allAttendees,
                    mainUserBusyPeriod
                );
                // Returns finalized available range [20,24]
                return finalizedTimeRange;
            })
            .then((resultRange) => {
                // resultRange is undefined if no friends synced their Gcal
                setFreeTime(resultRange); // Set state
                setIsLoading(false);
            })
            .catch((err) => {
                // Error occurs when no friends synced their Gcal, then we will use the manual input timings
                setFreeTime(props.finalTiming);
                setIsLoading(false);
            });
    });

    if (isLoading) {
        return <Text>Wait for all friends to input their time</Text>;
    }

    const onClose = () => setVisible(false);

    const onComplete = () => {
        dining.forEach((element) => finalized.push(element));
        selected.forEach((element) => {
            if (element !== "Food") finalized.push(element);
        });
        props.onFinalize([finalized, freeTime]);
        props.navigation.navigate("Finalized", { route: manual });
    };

    /**
     * Allows toggling background color and interaction between multiple buttons
     * @param {*} genre
     */
    const handlePress = (genre) => {
        // console.log(selected);
        // console.log(dining);
        selected.includes(genre)
            ? setSelected(selected.filter((s) => s !== genre))
            : setSelected([...selected, genre]);
    };

    /**
     * handles when the modal will be displayed and settles the dining option picked
     */
    const handleFoodPress = () => {
        if (selected.includes("Food")) {
            setSelected(selected.filter((s) => s !== "Food"));
            dining.pop();
        } else {
            setVisible(true);
        }
    };

    /**
     * Only allows for one dining option to be picked
     * @param {*} option
     */
    const selectDining = (option) => {
        let current = dining;
        if (current.length === 1) {
            current.pop();
        }
        current.push(option);
        setDining(current);
    };

    const buttons = () =>
        genreType.map((items) => (
            <TouchableOpacity
                key={items}
                onPress={() => handlePress(items)}
                style={[
                    styles.button,
                    {
                        backgroundColor: selected.includes(items)
                            ? "#8c8c8c"
                            : "#f2f2f2",
                    },
                ]}
            >
                <Text style={{ fontSize: 18 }}>{items}</Text>
            </TouchableOpacity>
        ));

    return (
        <View style={styles.container}>
            <Modal animated transparent visible={visible} animationType="fade">
                <PickerModal
                    onClose={onClose}
                    handlePress={handlePress}
                    selectDining={selectDining}
                />
            </Modal>

            <View style={styles.textContainer}>
                <Text style={{ fontFamily: 'serif', fontSize: 20 }}>
                    Choose your favourite genres!
                </Text>
            </View>

            <View View style={styles.buttonContainer}>
                {buttons()}

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: selected.includes("Food")
                                ? "#8c8c8c"
                                : "#f2f2f2",
                        },
                    ]}
                    onPress={() => handleFoodPress()}
                >
                    <Text style={{ fontSize: 18 }}>Food</Text>
                </TouchableOpacity>
            </View>

            <View
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    marginBottom: 36,
                }}
            >
                <TouchableOpacity
                    style={{ position: "absolute", marginLeft: 120 }}
                >
                    <AntDesign
                        name="arrowright"
                        size={32}
                        onPress={() => {
                            onComplete();
                            //console.log(props.finalGenres);
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        alignContent: "center",
        flexWrap: "wrap",
    },
    button: {
        borderRadius: 20,
        padding: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#24A6D9",
        marginHorizontal: 10,
        marginVertical: 10,
    },
    textContainer: {
        alignItems: "center",
        marginVertical: 100,
    },
});

const mapStateToProps = (state) => {
    return {
        finalGenres: state.genre.genres,
        finalTiming: state.timeline.finalTiming,
    };
};

export default connect(mapStateToProps, actions)(Genre);