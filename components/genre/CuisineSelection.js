import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { buttons } from "../../reusable-functions/buttons";
const CuisineSelection = ({ handleCuisinePress }) => {
    const [selected, setSelected] = React.useState([]);
    const cuisine = [
        "Asian",
        "Western",
        "Chinese",
        "Korean",
        "Indian",
        "Japanese",
        "Cafe",
        "Hawker",
    ];

    const handlePress = (cuisine) => {
        let newSelected = [];

        if (selected.includes(cuisine)) {
            newSelected = selected.filter((s) => s !== cuisine);
        } else {
            newSelected = selected.concat(cuisine);
        }

        setSelected(newSelected);
        handleCuisinePress(newSelected);
    };

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={styles.header}>Cuisine</Text>
            <View style={styles.buttonContainer}>
                {buttons(cuisine, selected, handlePress)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        padding: 5,
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 5,
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 20,
    },
    header: {
        marginLeft: 25,
        fontSize: 20,
        fontWeight: "bold",
    },
});

export default CuisineSelection;
