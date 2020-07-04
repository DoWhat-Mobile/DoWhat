import React from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';

/**
 * SuggestedFriends is used in two components, as a child of Friends, and as a child of
 * AllSuggestedFriendsModal. AllSuggestedFriends renders all friends, while this comonent
 * in Friends only renders the first 4 suggested friends. 
 * The toggling is controlled by the boolean flag "fullView" props 
 */
const SuggestedFriends = ({ friends, seeMore, fullView }) => {
    // Style of the individual cards
    const renderIndividualFriends = (friend) => {
        return (
            <View style={styles.friendCard}>
                <View style={{
                    borderTopWidth: 40, position: 'absolute', borderTopColor: '#b7b7a4',
                    alignSelf: 'stretch'
                }}>
                    <Text>             {/*This spacing is for styling*/}                       </Text>
                </View>
                <View style={{
                    flex: 1, width: '100%', alignItems: 'center',
                    justifyContent: 'center', borderTopColor: 'grey',
                }}>
                    <Image
                        source={{ uri: friend[0].profile_picture_url }}
                        style={{ height: 50, width: 50, borderRadius: 100 }}
                    />
                </View>
                <View style={{ flex: 1, }}>
                    <Text style={styles.nameStyle}>
                        {friend[0].first_name + ' ' + friend[0].last_name}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => alert("Add friend functionality")}
                    style={styles.addFriendButton}>
                    <Text style={{
                        fontWeight: 'bold', fontSize: 12, textAlign: 'center',
                        color: '#1d3557'
                    }}>
                        Add friend
                </Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View>
            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                <Text style={{ color: 'black', marginLeft: 5 }}>
                    {fullView ? 'All ' : ''}Suggested Friends
                </Text>
                <TouchableOpacity onPress={seeMore}>
                    <Text style={{ color: '#6c757d', marginRight: 5 }}>
                        {fullView ? 'Close' : 'See all'}
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={friends}
                horizontal={false}
                numColumns={4}
                renderItem={({ item }) => (
                    renderIndividualFriends(item)
                )}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    )
}

export default SuggestedFriends;

const styles = StyleSheet.create({
    friendCard: {
        borderWidth: 0.5,
        margin: 2,
        flexShrink: 1,
        borderRadius: 5,
        height: 150,
        width: 120,
    },
    nameStyle: {
        flexWrap: 'wrap',
        textAlign: 'center',

    },
    addFriendButton: {
        borderWidth: 0.5,
        margin: 5,
        marginTop: 0,
        borderColor: '#1d3557'
    }
});