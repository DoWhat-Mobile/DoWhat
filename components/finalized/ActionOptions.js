import React from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import ShuffleModal from "./ShuffleModal";
import TimeEdit from "./TimeEdit";

const ActionOptions = (props) => {
    const [shuffleVisible, setShuffleVisible] = React.useState(false);

    const windowHeight = Dimensions.get("window").height;

    return (
        <View style={{ flex: 1, flexDirection: "row" }}>
            <Modal animated visible={shuffleVisible} animationType="fade">
                <ShuffleModal
                    onReselect={props.onReselect}
                    onClose={props.onClose}
                    unsatisfied={props.unsatisfied}
                    genres={props.genres}
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
