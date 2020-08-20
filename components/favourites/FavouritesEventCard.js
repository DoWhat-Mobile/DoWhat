import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
} from 'react-native';
import { TIH_API_KEY } from 'react-native-dotenv';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';

/**
 * Home feed event card
 */
const FeedEventCard = ({
	event,
	isEventFood,
	sectionTitle,
	index,
	foodIndex,
	addingFavouritesToPlan,
	handleAddToFavourites,
	handleCardPress,
	selectFavouriteEventForPlan,
}) => {
	var imageURI = event[0].imageURL;
	var eventIsBeingAdded = event[2];
	const eventRatings = event[1];

	const renderHeartOrCheckbox = () => {
		if (eventIsBeingAdded) {
			return (
				<TouchableOpacity onPress={() => selectFavouriteEventForPlan(event, index)}>
					<Ionicons name='md-checkbox' size={24} color={COLORS.orange} />
				</TouchableOpacity>
			);
		}

		if (addingFavouritesToPlan) {
			return (
				<TouchableOpacity onPress={() => selectFavouriteEventForPlan(event, index)}>
					<MaterialCommunityIcons name='checkbox-blank-outline' size={24} color='white' />
				</TouchableOpacity>
			);
		}

		return (
			<TouchableOpacity
				onPress={() => handleAddToFavourites(event, sectionTitle, index, foodIndex)}
			>
				<MaterialCommunityIcons name='heart' color={COLORS.orange} size={24} />
			</TouchableOpacity>
		);
	};

	// If imageURI is a code, convert it to URI using TIH API
	if (imageURI.substring(0, 5) != 'https') {
		imageURI =
			'https://tih-api.stb.gov.sg/media/v1/download/uuid/' +
			imageURI +
			'?apikey=' +
			TIH_API_KEY;
	}

	return (
		<TouchableOpacity
			onPress={() =>
				handleCardPress({
					...event[0],
					imageURL: imageURI,
					ratings: event[1],
				})
			}
		>
			<ImageBackground
				source={{ uri: imageURI }}
				style={{
					height: Dimensions.get('window').height / 6,
					margin: 10,
				}}
				imageStyle={{ borderRadius: 10 }}
			>
				<View style={styles.container}>
					<View style={styles.body}>
						<View style={styles.titleContainer}>
							<Text
								numberOfLines={1}
								ellipsizeMode={'tail'}
								style={[styles.title, { width: isEventFood ? 200 : 250 }]}
							>
								{event[0].title}
							</Text>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									marginLeft: 10,
								}}
							>
								<MaterialCommunityIcons name='thumb-up' size={24} color='white' />
								<Text
									style={{
										fontSize: 19,
										color: 'white',
										fontWeight: 'bold',
										marginHorizontal: 5,
									}}
								>
									{' '}
									{eventRatings}
								</Text>
							</View>

							{renderHeartOrCheckbox()}
						</View>

						<Text
							style={{
								color: 'white',
								fontSize: 13,
								width: isEventFood ? 300 : 350,
							}}
							numberOfLines={1}
							ellipsizeMode={'tail'}
						>
							{event[0].description}
						</Text>
					</View>
				</View>
			</ImageBackground>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.1)',
		justifyContent: 'flex-end',
		width: Dimensions.get('window').width * 0.95,
		borderRadius: 10,
	},
	body: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.1)',
		justifyContent: 'flex-end',
		borderRadius: 10,
		padding: 15,
	},
	titleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		marginBottom: 5,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: 'white',
	},
});

export default FeedEventCard;
