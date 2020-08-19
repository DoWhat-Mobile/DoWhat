import React, { useCallback, useState } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	SectionList,
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import firebase from '../../database/firebase';
import { handleEventsOf } from '../../reusable-functions/HomeFeedLogic';
import { connect } from 'react-redux';
import {
	setAddingFavourites,
	addFavouritesToPlan,
	setAddingFavouritesToExistsingBoard,
} from '../../actions/favourite_event_actions';
import FeedEventCard from './FeedEventCard';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';

/**
 * User feed in home page. Has 3 divisions: Show whats popular, eateries, and activities
 * that the user does not normally engage in.
 * @param {*} props
 */
const Feed = (props) => {
	useFocusEffect(
		useCallback(() => {
			var isMounted = true;
			getDataFromFirebase();
			return () => {
				isMounted = false;
			};
		}, [props.allEvents])
	);

	const [isLoading, setIsLoading] = useState(true);
	const [whatsPopularData, setWhatsPopularData] = useState([]);
	const [hungryData, setHungryData] = useState([]);
	const [somethingNewData, setSomethingNewData] = useState([]);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [favourites, setFavourites] = useState([]); // All the favourited events, and whether or not they are selected
	// 0 , 1 , 2 for Popular, eateries & discover, used to toggle colouring of button when user selects
	const [currSelectedGenre, setCurrSelectedGenre] = useState(0);

	const getDataFromFirebase = async () => {
		try {
			const database = firebase.database();
			const userId = firebase.auth().currentUser.uid;
			database
				.ref('users/' + userId)
				.once('value')
				.then((snapshot) => {
					const userData = snapshot.val();
					const allCategories = props.allEvents; // Get all events from redux state

					// So home feed knows which events are favorited
					if (userData.hasOwnProperty('favourites')) {
						const userFavourites = userData.favourites;
						var favouritesArr = [];
						for (var event in userFavourites) {
							const formattedData = [
								userFavourites[event],
								userFavourites[event].rating,
								false,
							]; // Last boolean if is adding
							favouritesArr.push(formattedData);
						}
						setFavourites(favouritesArr);
					}

					if (Object.keys(allCategories).length !== 0) {
						// Check that event has already been loaded from redux state
						const data = handleEventsOf(allCategories, userData.preferences);
						setWhatsPopularData(data[0]);
						setHungryData(data[1]);
						setSomethingNewData(data[2]);
						setIsLoading(false);
					}
				});
		} catch (err) {
			console.log('Error getting data from firebase: ', err);
			getDataForFirstTimeUsers();
		}
	};

	// First time users has no preference history, and no favourited events
	const getDataForFirstTimeUsers = async () => {
		try {
			const database = firebase.database();
			database
				.ref('events')
				.once('value')
				.then((snapshot) => {
					const allCategories = snapshot.val();

					// Check that event has already been loaded from redux state
					if (Object.keys(allCategories).length !== 0) {
						const data = handleEventsOf(
							allCategories,
							undefined // No preferences yet
						);
						setWhatsPopularData(data[0]);
						setHungryData(data[1]);
						setSomethingNewData(data[2]);
						setIsLoading(false);
					}
				});
		} catch (err) {
			console.log('Error getting data for first time users: ', err);
		}
	};

	const refreshPage = () => {
		// When user scrolls to reload
		setIsRefreshing(true);
		getDataFromFirebase();
		setIsRefreshing(false);
	};

	// Add entire event into user's firebase node under favourites
	const handleAddToFavourites = (event, sectionTitle, index, foodIndex) => {
		var updates = {};
		var eventWithRating = event[0];
		eventWithRating.rating = event[1];
		eventWithRating.votes = 0; // For use in collaboration board

		// Visual cue to users, add heart to card
		if (sectionTitle == 'Eateries') {
			var newData = hungryData[index][foodIndex];
			newData[0].favourited = !newData[0].favourited; // Mark as favourited
			var finalData = [...hungryData[index]];
			finalData[foodIndex] = newData;
			setHungryData([[...finalData]]);
			eventWithRating.favourited = newData[0].favourited; // For Firebase update
		} else if (sectionTitle == 'Find something new') {
			var newData = somethingNewData[index];
			newData[0].favourited = !newData[0].favourited; // Mark as favourited
			var finalData = [...somethingNewData];
			finalData[index] = newData;
			setSomethingNewData([...finalData]);
			eventWithRating.favourited = newData[0].favourited; // For Firebase update
		} else {
			// What is popular
			console.log('HERE ! !! ! ! ', whatsPopularData[index], index);
			var newData = [...whatsPopularData[index]];
			newData[0].favourited = !newData[0].favourited; // Mark as favourited
			var finalData = [...whatsPopularData];
			finalData[index] = newData;
			setWhatsPopularData([...finalData]);
			eventWithRating.favourited = newData[0].favourited; // For Firebase update
		}

		if (eventWithRating.favourited) {
			updates['/favourites/' + event[0].id] = eventWithRating; // add

			// Add to component state, so no need to pull data from Firebase
			var additionalEvent = [];
			additionalEvent[0] = eventWithRating; // Entire event object
			additionalEvent[1] = event[1]; // Rating of event
			additionalEvent[2] = false; // Selected or not
			setFavourites([...favourites, additionalEvent]);
		} else {
			updates['/favourites/' + event[0].id] = null; // remove
			var newState = [...favourites];
			newState = newState.filter((currEvent) => currEvent[0].id != event[0].id);
			setFavourites(newState);
		}
		// Update Firebase
		firebase
			.database()
			.ref('/users/' + props.userID)
			.update(updates);
	};

	/**
	 * Horizontal <FlatList> for food choices
	 * @param {*} event is a 2D array of [[{eventDetails}, ratings], ...]
	 */
	const formatFoodArray = (allEvents, sectionTitle, sectionIndex) => {
		return (
			<FlatList
				data={allEvents}
				horizontal={true}
				renderItem={({ item, index }) => (
					<FeedEventCard
						event={item}
						isEventFood={true}
						sectionTitle={sectionTitle}
						index={sectionIndex}
						foodIndex={index}
						favourites={favourites}
						handleAddToFavourites={handleAddToFavourites}
					/>
				)}
				keyExtractor={(item, index) => item + index}
			/>
		);
	};

	const renderFeed = (item, section, index) => {
		if (section.title == 'Eateries') {
			return formatFoodArray(item, section.title, index); // Render eateries
		}
		return (
			<FeedEventCard
				event={item}
				isEventFood={false}
				sectionTitle={section.title}
				foodIndex={index}
				index={index}
				favourites={favourites}
				handleAddToFavourites={handleAddToFavourites}
			/>
		);
	};

	const scroll = (sectionIndex, itemIndex) => {
		setCurrSelectedGenre(sectionIndex); // For coloring of selected button
		sectionListRef.scrollToLocation({
			sectionIndex: sectionIndex,
			itemIndex: itemIndex,
			viewPosition: 0,
			viewOffSet: 10,
		});
	};

	const CategoryTitleText = ({ text, color }) => {
		return <Text style={[styles.CategoryTitleText, { color: color }]}>{text}</Text>;
	};

	const ListHeaderComponent = () => {
		return (
			<View style={styles.header}>
				<Image
					style={{
						borderRadius: 100,
						height: 30,
						width: 30,
						borderWidth: 1,
						borderColor: 'white',
						marginLeft: 16,
					}}
					source={{
						uri: props.userProfilePicture,
					}}
				/>

				<Text style={styles.headerText}>Welcome!</Text>

				<TouchableOpacity
					onPress={signOut}
					style={{
						color: 'white',
						textDecorationLine: 'underline',
						marginTop: 4,
						marginRight: 16,
					}}
				>
					<Feather name='more-horizontal' size={24} color='white' />
				</TouchableOpacity>
			</View>
		);
	};

	const HeaderCategoryButtons = () => {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'space-around',
					marginTop: 5,
				}}
			>
				<View
					style={{
						flex: 2.5,
						flexDirection: 'row',
						justifyContent: 'space-around',
						marginLeft: -5,
						marginVertical: 15,
					}}
				>
					<TouchableOpacity
						onPress={() => scroll(0, 0)}
						style={[
							styles.headerCategory,
							currSelectedGenre == 0 ? { backgroundColor: COLORS.orange } : {},
						]}
					>
						<Feather
							name='zap'
							size={24}
							color={currSelectedGenre == 0 ? 'white' : COLORS.orange}
						/>
						<CategoryTitleText
							text='POPULAR'
							color={currSelectedGenre == 0 ? 'white' : 'black'}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => scroll(1, 0)}
						style={[
							styles.headerCategory,
							currSelectedGenre == 1 ? { backgroundColor: COLORS.orange } : {},
						]}
					>
						<MaterialCommunityIcons
							name='palette-outline'
							size={24}
							color={currSelectedGenre == 1 ? 'white' : COLORS.orange}
						/>
						<CategoryTitleText
							text='EATERIES'
							color={currSelectedGenre == 1 ? 'white' : 'black'}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => scroll(2, 0)}
						style={[
							styles.headerCategory,
							currSelectedGenre == 2 ? { backgroundColor: COLORS.orange } : {},
						]}
					>
						<Feather
							name='camera'
							size={24}
							color={currSelectedGenre == 2 ? 'white' : COLORS.orange}
						/>
						<CategoryTitleText
							text='DISCOVER'
							color={currSelectedGenre == 2 ? 'white' : 'black'}
						/>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const signOut = () => {
		firebase.auth().signOut();
		props.navigation.navigate('Auth');
	};

	var sectionListRef = {}; // For anchor tag use

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	// Normal view
	return (
		<View style={styles.container}>
			<View style={{ flex: 1 }}>
				<ListHeaderComponent />
			</View>

			<View style={{ flex: 1 }}>
				<HeaderCategoryButtons />
			</View>

			<View style={{ flex: 8 }}>
				<SectionList
					onRefresh={() => refreshPage()}
					ref={(ref) => (sectionListRef = ref)}
					progressViewOffset={100}
					refreshing={isRefreshing}
					sections={[
						{
							title: 'Popular',
							data: whatsPopularData,
						}, // eventData[0] is an array of data items
						{ title: 'Eateries', data: hungryData }, // eventData[1] is an array of one element: [data]
						{ title: 'Discover', data: somethingNewData }, // eventData[2] is an array data items
					]}
					renderItem={({ item, section, index }) => renderFeed(item, section, index)}
					renderSectionHeader={({ section }) => (
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionHeaderText}>{section.title}</Text>
						</View>
					)}
					keyExtractor={(item, index) => index}
				/>
			</View>
		</View>
	);
};

const mapDispatchToProps = {
	setAddingFavourites,
	addFavouritesToPlan,
	setAddingFavouritesToExistsingBoard,
};

const mapStateToProps = (state) => {
	return {
		allEvents: state.add_events.events,
		userID: state.add_events.userID,
		userProfilePicture: state.add_events.profilePicture,
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Feed);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	headerCategory: {
		flexDirection: 'row',
		borderWidth: 0.2,
		borderColor: 'grey',
		paddingLeft: 14,
		paddingRight: 14,
		borderRadius: 30,
		alignSelf: 'center',
		backgroundColor: 'white',
		elevation: 1,
	},
	header: {
		flex: 1,
		elevation: 1,
		paddingTop: '10%',
		paddingBottom: '10%',
		flexDirection: 'row',
		backgroundColor: COLORS.orange,
		justifyContent: 'space-between',
	},
	CategoryTitleText: {
		color: 'black',
		textAlign: 'center',
		fontSize: 13,
		fontWeight: 'bold',
		marginTop: 2,
		marginLeft: 4,
	},
	sectionHeaderText: {
		fontSize: 22,
		fontWeight: 'bold',
		color: COLORS.orange,
		marginLeft: 10,
		marginBottom: 5,
		marginTop: 10,
	},
});
