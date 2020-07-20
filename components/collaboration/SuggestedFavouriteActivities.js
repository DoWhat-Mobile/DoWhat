import React from "react";
import {
    View, Text, StyleSheet,
    Image, FlatList, TouchableOpacity, Dimensions
} from "react-native";
import { Card, Badge } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TIH_API_KEY } from 'react-native-dotenv';

const SuggestedFavouriteActivities = ({ activities, handleFavouritesSelect }) => {
    const renderFavourites = (activity, selected, index) => {
        var imageURI = activity.imageURL
        // If imageURI is a code, convert it to URI using TIH API
        if (imageURI.substring(0, 5) != 'https') {
            imageURI = 'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
                imageURI + '?apikey=' + TIH_API_KEY;
        }

        return (
            <View style={styles.card}>
                <Badge
                    status="success"
                    value={selected
                        ? (activity.votes + 1).toString()
                        : activity.votes.toString()}
                    textStyle={{ color: 'white' }}
                    badgeStyle={selected ? { backgroundColor: '#E86830' }
                        : { backgroundColor: 'black' }}
                    containerStyle={{ position: 'absolute', top: -6, right: -6 }}

                />
                <View style={{
                    flex: 1, borderColor: 'grey', borderBottomWidth: 0.5,
                    justifyContent: 'center', paddingBottom: 5
                }}>
                    <Text style={{
                        fontSize: 12, fontWeight: 'bold', fontFamily: 'serif',
                        textAlign: 'center'

                    }}>{activity.title}</Text>
                </View>

                <View style={{ flex: 3, marginTop: 5 }}>
                    <Image
                        source={{ uri: imageURI }}
                        style={{ height: 30, width: Dimensions.get('window').width * 0.38 }}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                        <MaterialCommunityIcons name="map-marker" color={'black'} size={16} />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 12, color: '#1d3557', marginTop: 2, }}> {activity.location}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.favouritesButton, selected
                        ? { backgroundColor: 'grey' } : {}]}
                        onPress={() => handleFavouritesSelect(index)}>
                        {selected
                            ? <View >
                                <Text style={styles.favouritesButtonText}>
                                    UNVOTE
                                </Text>
                            </View>
                            : <View style={{ flexDirection: 'row' }}>
                                <MaterialCommunityIcons name="plus-one" color={'white'} size={16} />
                                <Text style={styles.favouritesButtonText}> UPVOTE</Text>
                            </View>
                        }
                    </TouchableOpacity>

                </View>
            </View>
        )
    }

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.genreSelectionText}>
                Suggested activities:
             </Text>
            {activities.length == 0
                ? <View style={{ justifyContent: 'center', alignContent: 'center' }}>
                    <Text style={{
                        fontSize: 16, fontWeight: 'bold', textAlign: "center",
                        fontFamily: 'serif'
                    }}>No activities suggested.</Text>
                    <Text style={{
                        margin: 5, fontSize: 12, color: 'grey', textAlign: "center",
                        fontFamily: 'serif'
                    }}>You can add a suggestion from your favourited activities
                             </Text>
                </View>
                : <FlatList
                    data={activities}
                    horizontal={true}
                    renderItem={({ item, index }) => renderFavourites(item[0], item[1], index)}
                    keyExtractor={(item, index) => item + index} />
            }
        </View>
    );
}

export default SuggestedFavouriteActivities;

const styles = StyleSheet.create({
    genreButton: {
        borderWidth: 0.5,
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    genreSelectionText: {
        fontFamily: 'serif',
        fontSize: 15,
        fontWeight: '800'
    },
    card: {
        padding: 5,
        margin: 5,
        width: Dimensions.get('window').width / 2.5,
        height: Dimensions.get('window').height / 6.2,
        borderWidth: 0.5,
        borderRadius: 10,
    },
    favouritesButton: {
        borderWidth: 0.1,
        flexDirection: 'row',
        padding: 2,
        borderRadius: 5,
        backgroundColor: '#E86830',
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 5
    },
    favouritesButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
    }
});