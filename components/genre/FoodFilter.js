import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from "react-native";
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
            <View style={styles.modal}>
                <AntDesign
                    name="close"
                    size={24}
                    onPress={() => onClose()}
                    style={styles.close}
                />
                <View style={styles.header}>
                    <Text
                        style={{
                            fontSize: 30,
                            fontWeight: "bold",
                        }}
                    >
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
                        <Text
                            style={{
                                marginLeft: 280,
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#F28333",
                            }}
                        >
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#00000080",
    },
    modal: {
        marginTop: 180,
        height: Dimensions.get("window").height - 180,
        backgroundColor: "#fff5e6",
        padding: 20,
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
    },
    header: {
        //flex: 1,
        marginTop: 10,
        //marginRight: 270,
    },
    body: {
        //  flex: 5,
    },
    footer: {
        //  flex: 2,
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
