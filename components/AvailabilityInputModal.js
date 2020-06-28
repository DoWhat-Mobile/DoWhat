import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { getBusyPeriodFromGoogleCal } from "../reusable-functions/GoogleCalendarGetBusyPeriods";
import Timeline from './Timeline';

/**
 * The modal that shows when user selects each of the individual upcoming plans
 */
const AvailabilityInputModal = ({ onClose, userID, date, styledDate, onFinalize }) => {
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Input avails button
    const [boardIsFinalized, setBoardIsFinalized] = useState(false);

    const inputAvailabilities = () => {
        getBusyPeriodFromGoogleCal(userID, date); // User ID comes from Redux state
        setIsButtonDisabled(true); // Prevent syncing google calendar twice
    }

    const finalizeBoard = () => {
        onFinalize();
        onClose();
    }

    const renderInputAvailabilitiesButton = () => {
        if (isButtonDisabled) {
            return (
                <View>
                    <TouchableOpacity style={[styles.finalizeButton, { borderRadius: 20, backgroundColor: '#2a9d8f', borderWidth: 0.2 }]}
                        disabled={true}
                        onPress={() => finalizeBoard()}>
                        <AntDesign
                            name="check"
                            size={20}
                            style={{ color: 'white' }}
                        />
                        <Text style={{ color: 'white', marginLeft: 5 }}>
                            Availabilities Inputted
                            </Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <TouchableOpacity style={styles.finalizeButton} onPress={() => inputAvailabilities()}
                    disabled={isButtonDisabled}>
                    <Text>Sync Google Calendar</Text>
                </TouchableOpacity>
            );
        }
    }

    const renderFinalizeButton = () => {
        if (boardIsFinalized) {
            return (
                <TouchableOpacity style={[styles.finalizeButton, { borderRadius: 20, backgroundColor: '#e63946', borderWidth: 0.2 }]}
                    disabled={true}
                    onPress={() => finalizeBoard()}>
                    <AntDesign
                        name="check"
                        size={20}
                        style={{ color: 'white' }}
                    />
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity style={styles.finalizeButton} onPress={() => finalizeBoard()}>
                <Text>Finalize</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.modal}>
            <Text style={styles.headerText}>
                Availabilities input for {styledDate}
            </Text>
            <AntDesign name="close" size={24}
                onPress={() => onClose()}
                style={styles.close}
            />

            <View style={styles.body}>
                <Timeline />
            </View>

            <View style={styles.buttonGroup}>
                {renderInputAvailabilitiesButton()}
                {renderFinalizeButton()}
            </View>
        </View >
    );
}

const mapStateToProps = (state) => {
    return {
        userID: state.add_events.userID,
        currUserName: state.add_events.currUserName
    };
};

export default connect(mapStateToProps, null)(AvailabilityInputModal);

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
        fontSize: 17,
        marginTop: '15%',
        marginLeft: '4%',
        fontFamily: 'serif'
    },
    body: {
        flex: 9,
        margin: 10,
    },
    footer: {
        flex: 1,
        margin: 10,
        marginTop: 0,
        borderWidth: 1,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    finalizeButton: {
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        flexDirection: 'row',
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