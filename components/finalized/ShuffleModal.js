import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Item from "./ModalItem";
import { data_shuffle } from "../../reusable-functions/DataTimeline";
import { connect } from "react-redux";
const ShuffleModal = (props) => {
    const [isLoading, setLoading] = React.useState(true);
    const [refresh, setRefresh] = React.useState(false);

    React.useEffect(() => {
        if (props.allEvents !== {}) {
            console.log(props.unsatisfied.time);
            setLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator
                    style={{ alignSelf: "center" }}
                    size="large"
                />
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <AntDesign
                    name="close"
                    size={24}
                    onPress={() => props.onClose()}
                    style={styles.close}
                />

                <FlatList
                    data={data_shuffle(
                        props.allEvents,
                        props.genres,
                        props.unsatisfied["time"],
                        props.unsatisfied["genre"],
                        props.filters
                    )}
                    renderItem={({ item }) => (
                        <Item
                            item={item}
                            onReselect={props.onReselect}
                            onClose={props.onClose}
                        />
                    )}
                    style={{ marginTop: 35 }}
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
    }
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

const mapStateToProps = (state) => {
    return {
        allEvents: state.add_events.events,
    };
};

export default connect(mapStateToProps, null)(ShuffleModal);
