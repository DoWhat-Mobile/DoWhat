import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import ShuffleModal from "./ShuffleModal";
import TimeEdit from "./TimeEdit";

const ActionOptions = (
    props
    // navigation,
    // data,
    // allEvents,
    // mapUpdate,
    // genres,
    // onHourChange,
    // onMinuteChange,
    // onSave,
    // onReselect,
    // onClose,
    // unsatisfied,
    // events,
    //genres,
) => {
    const [shuffleVisible, setShuffleVisible] = React.useState(false);

    return (
        <View style={{ flex: 1 }}>
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
                newTime={props.newTime}
                newTimeChange={props.newTimeChange}
            />
            <TouchableOpacity onPress={() => setShuffleVisible(true)}>
                <Text>Edit Event</Text>
            </TouchableOpacity>
        </View>
    );
};
export default ActionOptions;
