import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AreaSelection from "./AreaSelection";
import CuisineSelection from "./CuisineSelection";
import PriceSelection from "./PriceSelection";

const FoodFilter = ({ onClose, handlePress }) => {
    const [filters, setFilters] = React.useState({});

    React.useEffect(() => {
        setFilters({ area: "", cuisine: "", price: 0 });
    }, []);

    const handleAreaPress = (area) => {
        setFilters({ ...filters, area: area });
    };

    const handleCuisinePress = (cuisine) => {
        setFilters({ ...filters, cuisine: cuisine });
    };

    const handlePricePress = (price) => {
        let max = Math.max(...price);
        setFilters({ ...filters, price: max });
    };

    const handleConfirmPress = () => {
        console.log(filters);
    };
    return (
        <View style={styles.container}>
            {/* <View
                style={{
                    height: "60%",
                    marginTop: "auto",
                    backgroundColor: "white",
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                }}
            > */}
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
// import React from "react";
// import { View, Text, Picker, StyleSheet } from "react-native";
// import { AntDesign } from "@expo/vector-icons";

// const PickerModal = (props) => {
//     const dining = ["restaurants", "cafes", "hawker"];
//     const [pickerValue, setValue] = React.useState("restaurants");
//     const { onClose, handlePress, selectDining } = props;

//     return (
//         <View style={styles.modal}>
//             <View style={styles.pickerContainer}>
//                 <View style={styles.header}>
//                     <AntDesign
//                         name="close"
//                         size={24}
//                         onPress={() => onClose()}
//                         style={{ marginLeft: 10 }}
//                     />

//                     <Text style={{ fontSize: 18 }}>Food</Text>

//                     <AntDesign
//                         name="check"
//                         size={24}
//                         style={{ marginRight: 10 }}
//                         onPress={() => {
//                             handlePress("Food");
//                             selectDining(pickerValue);
//                             onClose();
//                         }}
//                     />
//                 </View>
//                 <Picker
//                     selectedValue={pickerValue}
//                     onValueChange={(value) => setValue(value)}
//                 >
//                     {dining.map((type) => (
//                         <Picker.Item key={type} value={type} label={type} />
//                     ))}
//                 </Picker>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     modal: {
//         flex: 1,
//         justifyContent: "flex-end",
//     },
//     pickerContainer: {
//         height: 200,
//         width: "100%",
//         backgroundColor: "white",
//     },
//     header: {
//         justifyContent: "space-between",
//         flexDirection: "row",
//         alignItems: "center",
//         backgroundColor: "#eee",
//     },
// });
// export default PickerModal;
