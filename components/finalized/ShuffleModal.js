import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const ShuffleModal = ({ onReselect, onClose, unsatisfied, events }) => {
    return (
        <View style={styles.container}>
            <Text>{unsatisfied}</Text>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});

export default ShuffleModal;
