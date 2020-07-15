import React from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import ShuffleModal from "./ShuffleModal";
import TimeEdit from "./TimeEdit";
import { AntDesign } from "@expo/vector-icons";

const ActionOptions = (props) => {
    const [shuffleVisible, setShuffleVisible] = React.useState(false);

    const windowHeight = Dimensions.get("window").height;

    return (
        <View style={{ flex: 1, flexDirection: "row" }}>
            <AntDesign
                name="close"
                size={24}
                onPress={() => props.onClose()}
                style={{
                    position: "absolute",
                    left: 350,
                    right: 0,
                    top: 15,
                    bottom: 0,
                    zIndex: 1,
                }}
            />
            <Modal animated visible={shuffleVisible} animationType="fade">
                <ShuffleModal
                    onReselect={props.onReselect}
                    onClose={props.onClose}
                    unsatisfied={props.unsatisfied}
                    genres={props.genres}
                    filters={props.filters}
                />
            </Modal>
            <TimeEdit
                onClose={props.onClose}
                newTime={props.unsatisfied["time"]}
                newTimeChange={props.newTimeChange}
            />
            <TouchableOpacity
                style={{
                    width: "50%",
                    alignItems: "center",
                    backgroundColor: "white",
                }}
                onPress={() => setShuffleVisible(true)}
            >
                <Text style={{ marginTop: windowHeight / 2, fontSize: 25 }}>
                    Edit Event
                </Text>
            </TouchableOpacity>
        </View>
    );
};
export default ActionOptions;
