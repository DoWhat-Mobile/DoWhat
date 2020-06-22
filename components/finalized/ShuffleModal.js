import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Item from "./ModalItem";
import { data_shuffle } from "../../reusable-functions/data_timeline";

const ShuffleModal = ({ onReselect, onClose, unsatisfied, events, genres }) => {
    const [refresh, setRefresh] = React.useState(false);
    return (
        <View style={styles.container}>
            <AntDesign
                name="close"
                size={24}
                onPress={() => onClose()}
                style={styles.close}
            />
            <FlatList
                data={data_shuffle(
                    events,
                    genres,
                    unsatisfied["time"],
                    unsatisfied["genre"]
                )}
                renderItem={({ item }) => (
                    <Item
                        item={item}
                        onReselect={onReselect}
                        onClose={onClose}
                    />
                )}
                style={{ marginTop: 40 }}
                keyExtractor={(item) => item.title}
            />
            <TouchableOpacity
                style={{ marginBottom: 25 }}
                onPress={() => setRefresh(!refresh)}
            >
                <Text style={{ fontSize: 20 }}>Load More</Text>
            </TouchableOpacity>
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
