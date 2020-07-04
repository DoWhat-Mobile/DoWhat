import React from 'react';
import { View, StyleSheet } from 'react-native'
import SuggestedFriends from './SuggestedFriends';

/**
 * AllSuggestedFriendsModal uses SuggestedFriends component, friends prop now includes
 * all the DoWhat users instead of only a limited number in SuggestedFriends. 
 */
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