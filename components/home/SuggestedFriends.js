import React from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';

const SuggestedFriends = ({ friends, openModal }) => {
    // Style of the individual cards
    const renderIndividualFriends = (friend) => {
        return (
            <View style={styles.friendCard}>
                <View style={{
                    borderTopWidth: 40, position: 'absolute', borderTopColor: '#b7b7a4',
                    alignSelf: 'stretch'
                }}>
                    <Text>     {/*This spacing is for styling*/}                       </Text>
                </View>
                <View style={{
                    flex: 1, width: '100%', alignItems: 'center',
                    justifyContent: 'center', borderTopColor: 'grey',
                }}>
                    <Image
                        source={{ uri: friend.profilePicture }}
                        style={{ height: 50, width: 50, borderRadius: 100 }}
                    />
                </View>
                <View style={{ flex: 1, }}>
                    <Text style={styles.nameStyle}>{friend.name}</Text>
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
                <Text style={{ color: 'black', marginLeft: 5 }}>Suggested Friends</Text>
                <TouchableOpacity onPress={openModal}>
                    <Text style={{ color: '#6c757d', marginRight: 5 }}>See all</Text>
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