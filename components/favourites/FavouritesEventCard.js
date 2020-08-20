import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TIH_API_KEY } from 'react-native-dotenv';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadMore from 'react-native-read-more-text';

/**
 * Home feed event card
 */
const FavouritesEventCard = ({
	event,
	isEventFood,
	sectionTitle,
	index,
	foodIndex,
	favourites,
	addingFavouritesToPlan,
}) => {
	const isEventBeingAddedToPlan = event[2];

	const checkIfEventIsFavourited = (event) => {
		var isEventFavourited = false;
		favourites.forEach((selectedEvent) => {
			const favouritedEventID = selectedEvent[0].id;
			if (favouritedEventID == event[0].id) {
				isEventFavourited = true;
			}
		});

		return event[0].favourited || isEventFavourited;
	};

	var isEventFavourited = false; // Separate variable as .favourited property dont exist
	if (checkIfEventIsFavourited(event)) {
		isEventFavourited = true;
	}

	const renderTruncatedFooter = (handlePress) => {
		return (
			<Text
				style={{
					color: '#595959',
					marginVertical: 5,
				}}
				onPress={handlePress}
			>
				Read more
			</Text>
		);
	};

	const renderRevealedFooter = (handlePress) => {
		return (
			<Text
				style={{
					color: '#595959',
					marginVertical: 5,
				}}
				onPress={handlePress}
			>
				Show less
			</Text>
		);
	};

	var imageURI = event[0].imageURL;
	const eventRatings = event[1] + '/5';

	// If imageURI is a code, convert it to URI using TIH API
	if (imageURI.substring(0, 5) != 'https') {
		imageURI =
			'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
			imageURI +
			'?apikey=' +
			TIH_API_KEY;
	}

	return (
		<View>
			<View
				style={{
					flex: 1,
					width: Dimensions.get('window').width,
					marginVertical: 20,
					backgroundColor: 'white',
					elevation: 5,
				}}
			>
				<Image
					source={{ uri: imageURI }}
					style={{
						height: isEventFood ? 100 : 210,
						width: '100%',
					}}
				/>

				<Text
					style={{
						fontSize: 18,
						fontWeight: 'bold',
						paddingTop: 20,
						paddingHorizontal: 10,
						borderTopWidth: 0.5,
					}}
				>
					{event[0].title}
				</Text>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						paddingHorizontal: 10,
						marginBottom: 10,
					}}
				>
					<View style={{ flexDirection: 'row' }}>
						<MaterialCommunityIcons name='star' color={'#1d3557'} size={24} />
						<Text
							style={{
								fontSize: 16,
								color: '#1d3557',
								marginTop: 2,
							}}
						>
							{' '}
							{eventRatings}
						</Text>
					</View>
					<TouchableOpacity
						disabled={sectionTitle == 'favourites'}
						onPress={() => handleAddToFavourites(event, sectionTitle, index, foodIndex)}
					>
						{isEventFavourited ? (
							<MaterialCommunityIcons name='heart' color={'#e63946'} size={24} />
						) : (
							<MaterialCommunityIcons
								name='heart-outline'
								color={'black'}
								size={24}
							/>
						)}
					</TouchableOpacity>
				</View>

				<View style={{ marginLeft: 10 }}>
					<ReadMore
						numberOfLines={1}
						renderTruncatedFooter={renderTruncatedFooter}
						renderRevealedFooter={renderRevealedFooter}
					>
						<Text
							style={{
								marginHorizontal: 10,
								marginVertical: 5,
								fontSize: 16,
							}}
						>
							{event[0].description}
							{'\n'}
						</Text>
					</ReadMore>
				</View>

				{sectionTitle == 'favourites' ? (
					addingFavouritesToPlan ? (
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'space-between',
								marginTop: 25,
							}}
						>
							<TouchableOpacity
								style={styles.favouritesButton}
								onPress={() => handleRemoveFavourites(event, index)}
							>
								<Text style={styles.favouritesButtonText}>
									REMOVE FROM FAVOURITES
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.favouritesButton}
								onPress={() => handleFavouriteEventPress(event, index)}
							>
								<Text style={styles.favouritesButtonText}>
									{isEventBeingAddedToPlan ? 'ADDED' : 'ADD TO PLAN'}
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								marginTop: 5,
							}}
						>
							<TouchableOpacity
								style={styles.favouritesButton}
								onPress={() => handleRemoveFavourites(event)}
							>
								<Text style={styles.favouritesButtonText}>
									REMOVE FROM FAVOURITES
								</Text>
							</TouchableOpacity>
						</View>
					)
				) : null}
			</View>
		</View>
	);
};

export default FavouritesEventCard;

const styles = StyleSheet.create({
	favouritesButton: {
		borderWidth: 0.1,
		padding: 5,
	},
	favouritesButtonText: {
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center',
		color: 'black',
	},
});
