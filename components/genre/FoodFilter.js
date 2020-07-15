import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AreaSelection from "./AreaSelection";
import CuisineSelection from "./CuisineSelection";
import PriceSelection from "./PriceSelection";

const FoodFilter = ({ onClose, handlePress, selectFilter }) => {
    const [filters, setFilters] = React.useState({});

    React.useEffect(() => {
        setFilters({ area: "", cuisine: "", price: 0 });
    }, []);

    const handleAreaPress = (area) => {
        setFilters((prevState) => ({ ...prevState, area: area }));
    };

    const handleCuisinePress = (cuisine) => {
        setFilters((prevState) => ({ ...prevState, cuisine: cuisine }));
    };

    const handlePricePress = (price) => {
        setFilters((prevState) => ({ ...prevState, price: price }));
    };

    const handleConfirmPress = () => {
        handlePress("food");
        selectFilter(filters);
        onClose();
    };
    return (
        <View style={styles.container}>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
            <View style={styles.header}>
                <Text style={{ fontSize: 30, fontWeight: "bold" }}>
                    Filters
                </Text>
            </View>

            <View style={styles.body}>
                <AreaSelection handleAreaPress={handleAreaPress} />
                <CuisineSelection handleCuisinePress={handleCuisinePress} />
                <PriceSelection handlePricePress={handlePricePress} />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={() => {
                        handleConfirmPress();
                    }}
                >
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flex: 1,
        marginTop: 40,
        marginRight: 270,
    },
    body: {
        flex: 5,
    },
    footer: {
        flex: 2,
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});

export default FoodFilter;
