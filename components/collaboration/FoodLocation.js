import React from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Badge } from 'react-native-elements';

const FoodLocation = ({ location, handleLocationSelect, preferences }) => {
    const topVoted = Object.keys(preferences).reduce((x, y) => {
        return preferences[x] > preferences[y]
            ? x
            : y
    })

    const renderLocation = (location, selected, index) => {
        const locationIsTopVoted = location == topVoted.toUpperCase()
        const numVotes = preferences[location.toLowerCase()]
        if (!selected) {
            return (
                <View>
                    <TouchableOpacity style={styles.genreButton}
                        onPress={() => handleLocationSelect(index)}>
                        <Text style={styles.buttonText}>{location}</Text>
                    </TouchableOpacity>
                    {locationIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, left: 0 }}
                            value={numVotes}
                            badgeStyle={{ backgroundColor: 'black', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold' }}
                        />
                        : null
                    }

                    {locationIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, right: 2 }}
                            value={'Top Voted'}
                            badgeStyle={{ backgroundColor: '#E86830', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold' }}
                        />
                        : null
                    }
                </View>
            );
        } else {
            return (
                <View>
                    <TouchableOpacity style={[styles.genreButton, {
                        backgroundColor: '#E86830',
                        borderColor: '#E13F19'
                    }]}
                        onPress={() => handleLocationSelect(index)}>
                        <Text style={[styles.buttonText, {
                            color: '#FEFBFA'
                        }]}>
                            {location}</Text>
                    </TouchableOpacity>
                    {locationIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, left: 0 }}
                            value={numVotes + 1}
                            badgeStyle={{ backgroundColor: 'white', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold', color: 'black' }}
                        />
                        : null

                    }

                    {locationIsTopVoted
                        ? <Badge
                            containerStyle={{ position: 'absolute', top: 0, right: 2 }}
                            value={'Top Voted'}
                            badgeStyle={{ backgroundColor: 'white', opacity: 100 }}
                            textStyle={{ fontSize: 9, fontWeight: 'bold', color: 'black' }}
                        />
                        : null
                    }

                </View>
            );
        }
    }

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.genreSelectionText}>Location</Text>
            <FlatList
                data={location}
                horizontal={true}
                renderItem={({ item, index }) => renderLocation(item[0], item[1], index)}
                keyExtractor={(item, index) => item + index}
            />
        </View>
    );
}

export default FoodLocation;

const styles = StyleSheet.create({
    genreButton: {
        borderWidth: 0.5,
        padding: 12,
        borderRadius: 5,
        margin: 5,
        marginRight: 10,
        width: 90,
    },
    genreSelectionText: {
        fontFamily: 'serif',
        fontSize: 15,
        fontWeight: '800'
    },
    buttonText: {
        fontFamily: 'serif', fontSize: 11, fontWeight: '100', textAlign: 'center'
    }
});