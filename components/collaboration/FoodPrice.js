import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const FoodPrice = ({ handlePricePress }) => {
    const [selected, setSelected] = React.useState([]);
    const price = [1, 2, 3, 4];

    const handlePress = (price) => {
        let arr = [];
        for (let i = 1; i <= price; i++) {
            arr.push(i);
        }
        setSelected(arr);
        handlePricePress(price);
    };

    const buttons = () =>
        price.map((price) => (
            <TouchableOpacity
                key={price}
                onPress={() => {
                    handlePress(price);
                }}
                style={styles.button}
            >
                <Text
                    style={{
                        fontSize: 15,
                        color: !selected.includes(price) ? "gray" : "black",
                    }}
                >
                    $
                </Text>
            </TouchableOpacity>
        ));

    return (
        <View style={styles.container}>
            <Text style={styles.genreSelectionText}>Price</Text>
            <View style={styles.buttonContainer}>{buttons()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginTop: 10,
    },
    genreSelectionText: {
        fontSize: 15,
        fontWeight: "800",
    },
    button: {
        marginHorizontal: 1,
        marginVertical: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 10,
    },
});

export default FoodPrice;
