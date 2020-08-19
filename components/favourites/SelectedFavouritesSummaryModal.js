import React from 'react';
import {
    View, StyleSheet, Text, TouchableOpacity,
    FlatList, Dimensions, Image,
} from 'react-native';
import { Badge } from 'react-native-elements'
import { TIH_API_KEY } from 'react-native-dotenv';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SelectedFavouritesSummaryModal = ({ onClose, allEvents, removeSelectedFavourite }) => {
    const renderSummaryItem = (activity, index) => {
        var imageURI = activity.imageURL
        // If imageURI is a code, convert it to URI using TIH API
        if (imageURI.substring(0, 5) != 'https') {
            imageURI = 'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
                imageURI + '?apikey=' + TIH_API_KEY;
        }

        return (
            <View style={styles.card}>
                <Image
                    source={{ uri: imageURI }}
                    style={{
                        height: Dimensions.get('window').height * 0.14,
                        width: Dimensions.get('window').width * 0.28,
                        borderRadius: 10,
                    }}
                />
                <View style={{
                    flex: 1, borderColor: 'grey', justifyContent: 'center',
                    paddingBottom: 5, flexDirection: 'column'
                }}>
                    <View style={{ height: Dimensions.get('window').height * 0.07 }}>
                        <Text style={{
                            fontSize: 16, fontWeight: 'bold',
                            textAlign: 'left', marginLeft: 10

                        }}>{activity.title}</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 8 }}>
                            <MaterialCommunityIcons name="map-marker" color={'black'} size={16} />
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 12, color: '#1d3557', marginTop: 2, }}> {activity.location}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.removeButton}
                        onPress={() => removeSelectedFavourite(activity.id)}>
                        <MaterialCommunityIcons name="minus" color={'white'} size={16} />
                    </TouchableOpacity>

                </View>
            </View >
        )
    }

    const cleanedEvents = allEvents.filter(event => { // Remove all non-selected favourite events
        return event[2]; // True is selected
    })
    return (
        <View style={styles.modalContainer}>
            <Badge
                value={
                    <MaterialCommunityIcons
                        name="chevron-down"
                        color={"#cc5237"}
                        size={28}
                    />
                }
                badgeStyle={{
                    backgroundColor: "white",
                    paddingTop: 15,
                    paddingBottom: 15,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderWidth: 0,
                }}
                onPress={onClose}
                containerStyle={{
                    position: "relative",
                    top: 0,
                    right: -100,
                }}
            />
            <FlatList
                data={cleanedEvents}
                horizontal={false}
                renderItem={({ item, index }) => renderSummaryItem(item[0], index)}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    )
}

export default SelectedFavouritesSummaryModal;

const styles = StyleSheet.create({
    modalContainer: {
        height: '60%',
        width: '90%',
        marginLeft: '5%',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        backgroundColor: "#cc5237",
    },
    card: {
        padding: 5,
        margin: 5,
        width: Dimensions.get('window').width / 1.2,
        height: Dimensions.get('window').height / 6.2,
        borderBottomWidth: 0.3,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
    },
    removeButton: {
        borderWidth: 0.1,
        padding: 2,
        borderRadius: 5,
        backgroundColor: '#E86830',
        marginTop: '16%',
        alignSelf: 'flex-end',
    },
    favouritesButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
    }
})