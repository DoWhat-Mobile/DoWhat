import React, { useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    SectionList
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';

const IndividualPlanModal = ({ onClose }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style>
                    <Text style={styles.headerText}>Your Outing</Text>
                </View>
                <AntDesign
                    name="close"
                    size={24}
                    onPress={() => onClose()}
                    style={styles.close}
                />
            </View>

            <View style={styles.body}>
            </View>
        </View>
    );
}

export default connect()(IndividualPlanModal);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        flexDirection: "column",
        justifyContent: 'space-around',
    },
    headerText: {
        fontWeight: '800',
        fontSize: 20,
        marginTop: '15%',
        marginLeft: '8%',
        fontFamily: 'serif'

    },
    headerButton: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'flex-end',
        borderRadius: 100,
        paddingRight: 15,
        paddingLeft: 15,
        paddingBottom: 25,
        paddingTop: 25,
        marginBottom: 10,
        marginRight: '5%',
        borderWidth: 1,
    },
    body: {
        flex: 8,
        justifyContent: 'center',
    },
    addFriendButton: {
        borderWidth: 1,
        justifyContent: 'flex-end'

    },
    friend: {
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: '5%',
        marginRight: '10%',
        paddingBottom: '2%',
        paddingTop: '2%',
        borderRadius: 8,

    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-between',
        padding: 5,

    },
    footer: {
        flex: 1,
    },
    close: {
        position: "absolute",
        left: 350,
        right: 0,
        top: 15,
        bottom: 0,
    },
});