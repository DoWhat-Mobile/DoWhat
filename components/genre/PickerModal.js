import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const PickerModal = ({ onClose, handlePress, selectDining }) => {
    return (
        <View style={styles.container}>
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

export default PickerModal;
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
