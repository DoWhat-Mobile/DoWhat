import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { connect } from 'react-redux';
import { formatDate } from '../DateSelection';

/**
 * Modal as a child component in AllPlans.js, used to funnel users into a specefic route 
 * in the app
 */
const RouteFilterModal = ({ onClose, navigation }) => {
    const routeOptions = ['invite', 'collab', 'manual']

    // Navigate to date selection page, with props required for different routes
    const navigateToDateSelect = (item) => {
        if (item == 'manual') {
            navigation.navigate("DateSelection", { route: 'manual' })
        } else if (item == 'collab') {
            navigation.navigate("DateSelection", { route: 'collab' })
        } else {
            navigation.navigate("DateSelection", { route: 'invite' })
        }
        onClose()
    }

    const renderInviteCard = () => {
        return (
            <TouchableOpacity style={[styles.individualCard, { backgroundColor: '#5846DE' }]}
                onPress={() => navigateToDateSelect('invite')}>
                <Text style={styles.titleText}>Plan with Friends without DoWhat app</Text>
                <View>
                    <Text style={styles.subTitleText}>
                        Select this option if your friends do not use DoWhat
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    const renderManualCard = () => {
        return (
            <TouchableOpacity style={[styles.individualCard, { backgroundColor: '#B65E76' }]}
                onPress={() => navigateToDateSelect('manual')}>
                <Text style={styles.titleText}>Manual Input</Text>
                <View>
                    <Text style={styles.subTitleText}>
                        Select this option if you know all your friends' availabilities
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    const renderCollabCard = () => {
        return (
            <TouchableOpacity style={[styles.individualCard, { backgroundColor: '#E29E40' }]}
                onPress={() => navigateToDateSelect('collab')}>
                <Text style={styles.titleText}>Plan with DoWhat Friends</Text>
                <View>
                    <Text style={styles.subTitleText}>
                        Select this option if you already have friends in DoWhat
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    const renderIndividualOptions = (item) => {
        if (item == 'manual') {
            return renderManualCard()
        } else if (item == 'collab') {
            return renderCollabCard()
        } else {
            return renderInviteCard()
        }
    }

    return (
        <View style={styles.modalContainer}>
            <AntDesign name="close" size={24}
                onPress={() => onClose()}
                style={{ marginLeft: 30, marginTop: 10, }}
            />
            <View style={{ flex: 1, }}>
                <FlatList
                    data={routeOptions}
                    horizontal={true}
                    renderItem={({ item }) => (
                        renderIndividualOptions(item)
                    )}
                    initialScrollIndex={0.65}
                    keyExtractor={(item, index) => item + index}
                />
            </View>
        </View>
    )
}

export default RouteFilterModal;

const styles = StyleSheet.create({
    modalContainer: {
        height: '40%',
        width: '100%',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        backgroundColor: '#ced4da'
    },
    individualCard: {
        borderWidth: 0.1,
        margin: 20,
        height: '75%',
        borderRadius: 10,
        width: 200,
        elevation: 100,
    },
    titleText: {
        margin: 5,
        marginLeft: 20,
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    subTitleText: {
        fontSize: 14,
        color: '#f0f0f5',
        marginTop: '50%',
        marginLeft: 20,

    }

});