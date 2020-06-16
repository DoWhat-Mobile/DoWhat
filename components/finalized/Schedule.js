import React from "react";
import Timeline from "react-native-timeline-flatlist";
import { data_timeline } from "../../reusable-functions/data_timeline";
import { Modal, View, StyleSheet } from "react-native";
import ShuffleModal from "./ShuffleModal";

const Schedule = ({ timeline, testEvents, events }) => {
    const [data, setData] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [unsatisfied, setUnsatisfied] = React.useState("");

    React.useEffect(() => {
        setData(data_timeline(timeline, testEvents, events, visible));
    }, []);

    const onReselect = (selected) => {
        const updatedData = data.map((item) => {
            if (item === unsatisfied) return selected;
            return item;
        });
        setData(updatedData);
    };

    const onClose = () => {
        setVisible(false);
    };

    const onEventPress = (event) => {
        setUnsatisfied(event);
        setVisible(true);
    };

    return (
        <View style={styles.container}>
            <Modal animated visible={visible} animationType="fade">
                <ShuffleModal
                    onReselect={onReselect}
                    onClose={onClose}
                    unsatisfied={unsatisfied}
                    events={events}
                />
            </Modal>
            <Timeline
                onEventPress={(event) => onEventPress(event)}
                data={data}
                timeStyle={{
                    textAlign: "center",
                    backgroundColor: "#ff9797",
                    color: "white",
                    padding: 5,
                    borderRadius: 13,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Schedule;
