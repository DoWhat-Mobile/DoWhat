import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { buttons } from "../../reusable-functions/buttons";
const AreaSelection = ({ handleAreaPress }) => {
    const [selected, setSelected] = React.useState([]);
    const areas = ["North", "East", "West", "Central"];

    const handlePress = (area) => {
        let newSelected = [];

        if (selected.includes(area)) {
            newSelected = selected.filter((s) => s !== area);
        } else {
            newSelected = selected.concat(area);
        }

        setSelected(newSelected);
        handleAreaPress(newSelected);
    };

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={styles.header}>Areas</Text>
            <View style={styles.buttonContainer}>
                {buttons(areas, selected, handlePress)}
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

export default AreaSelection;
