import React from 'react';
import { View, StyleSheet, Text, TouchableOpacty } from 'react-native'
import SuggestedFriends from './SuggestedFriends';

const AllSuggestedFriendsModal = ({ friends, closeOverlay }) => {
    return (
        <View style={styles.container}>
            <SuggestedFriends friends={friends} seeMore={closeOverlay} fullView={true} />
        </View>
    )
}

export default AllSuggestedFriendsModal;

const styles = StyleSheet.create({
    container: {
        height: '80%',
        width: '100%'
    }
})