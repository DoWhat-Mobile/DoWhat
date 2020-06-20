import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const IndividualPlanModal = ({ onClose, board }) => {
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button

    const formatDate = (day, month, date) => {
        const possibleDays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wenesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const possibleMonths = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const curDay = possibleDays[day];
        const curMonth = possibleMonths[month];
        return curDay + ", " + curMonth + " " + date;
    };

    const finalizeBoard = () => {

    }

    const inputAvailabilities = () => {
        setIsButtonDisabled(true); // Prevent syncing google calendar twice

    }

    const selectedDate = new Date(board.selected_date);

    return (
        <View style={styles.modal}>
            <Text style={styles.headerText}>Your Outing on {formatDate(selectedDate.getDay(), selectedDate.getMonth(), selectedDate.getDate())}</Text>
            <AntDesign name="close" size={24}
                onPress={() => onClose()}
                style={styles.close}
            />

            <View style={styles.body}>
            </View>

            <View style={styles.footer}>

            </View>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={[styles.finalizeButton, isButtonDisabled ? { backgroundColor: 'green' } : {}]} onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}>
                    <Text>Input Availabilities</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.finalizeButton} onPress={() => finalizeBoard()}>
                    <Text>Finalize</Text>
                </TouchableOpacity>
            </View>
        </View >
    );
}

export default connect()(IndividualPlanModal);

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        marginBottom: '20%',
        marginTop: '10%',
        marginLeft: '5%',
        marginRight: '5%',
        backgroundColor: "white",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 20,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
    },
    header: {
        flex: 1,
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '15%',
        marginLeft: '8%',
        fontFamily: 'serif'

    },
    body: {
        flex: 8,
    },
    footer: {
        flex: 1,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    finalizeButton: {
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignSelf: 'flex-end',
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
    },
    close: {
        position: "absolute",
        left: 330,
        right: 0,
        top: 25,
        bottom: 0,
    },
});