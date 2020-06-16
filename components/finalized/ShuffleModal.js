import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Item from "./ModalItem";
import { data_shuffle } from "../../reusable-functions/data_timeline";

const ShuffleModal = ({ onReselect, onClose, unsatisfied, events }) => {
    return (
        <View style={styles.container}>
            {/* <Text>{unsatisfied}</Text> */}
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
            <FlatList
                data={data_shuffle(
                    events,
                    unsatisfied["id"],
                    unsatisfied["time"]
                )}
                renderItem={({ item }) => (
                    <Item
                        item={item}
                        onReselect={onReselect}
                        onClose={onClose}
                    />
                )}
                keyExtractor={(item) => item.name}
                style={{ marginTop: 40 }}
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
    item: {
        backgroundColor: "#f9c2ff",
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 32,
    },
});

export default ShuffleModal;
