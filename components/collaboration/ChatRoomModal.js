import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    SectionList
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';

/**
 * Modal that shows when user opens chat room of the collaborative board 
 */
const ChatRoomModal = ({ onClose }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Chat Room</Text>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
        </View>
    );
};

// Get previously inputted date from DateSelection for API call
const mapStateToProps = (state) => {
};

export default connect(null, null)(ChatRoomModal);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});