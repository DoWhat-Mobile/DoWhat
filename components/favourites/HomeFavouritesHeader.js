import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Header of favourites component, presentational component.
 */
const HomeFavouritesHeader = ({
	addingFavouritesToPlan,
	resetAddingFavourites,
	setAddFavouritesToPlan,
	viewAllEvents,
	numOfFavouriteEvents,
}) => {
	const noFavouriteEventsYet = numOfFavouriteEvents == 0;
	const CategoryTitleText = ({ text }) => {
		return <Text style={styles.CategoryTitleText}>{text}</Text>;
	};

	if (addingFavouritesToPlan) {
		return (
			<View style={styles.headerBar}>
				<View style={styles.planWithFavouritesButton}>
					<TouchableOpacity
						onPress={resetAddingFavourites}
						style={[
							styles.headerCategory,
							{
								backgroundColor: '#e63946',
							},
						]}
					>
						<MaterialCommunityIcons name='reply' color={'white'} size={30} />
					</TouchableOpacity>
					<CategoryTitleText text='Back' />
				</View>
				<View
					style={{
						flex: 2.5,
						flexDirection: 'row',
						justifyContent: 'space-around',
					}}
				>
					<View>
						<TouchableOpacity onPress={viewAllEvents} style={styles.headerCategory}>
							<MaterialCommunityIcons
								name='reorder-horizontal'
								color={'black'}
								size={30}
							/>
						</TouchableOpacity>
						<CategoryTitleText text='Back to all Events' />
					</View>
				</View>
			</View>
		);
	}
	return (
		<View style={styles.headerBar}>
			<View style={styles.planWithFavouritesButton}>
				<TouchableOpacity
					disabled={noFavouriteEventsYet}
					onPress={setAddFavouritesToPlan}
					style={[
						styles.headerCategory,
						noFavouriteEventsYet
							? { backgroundColor: 'grey' }
							: { backgroundColor: '#ff664a' },
					]}
				>
					<MaterialCommunityIcons name='animation' color={'white'} size={30} />
				</TouchableOpacity>
				<CategoryTitleText text='Plan with Favourites' />
			</View>
			<View
				style={{
					flex: 2.5,
					flexDirection: 'row',
					justifyContent: 'space-around',
				}}
			>
				<View>
					<TouchableOpacity onPress={viewAllEvents} style={styles.headerCategory}>
						<MaterialCommunityIcons
							name='reorder-horizontal'
							color={'black'}
							size={30}
						/>
					</TouchableOpacity>
					<CategoryTitleText text='Back to all Events' />
				</View>
			</View>
		</View>
	);
};

export default HomeFavouritesHeader;

const styles = StyleSheet.create({
	headerBar: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 5,
	},
	planWithFavouritesButton: {
		flex: 1,
		borderRightWidth: 1,
		marginLeft: 5,
	},
	CategoryTitleText: {
		color: 'black',
		textAlign: 'center',
		fontSize: 13,
		fontWeight: 'bold',
		marginTop: 10,
	},
	headerCategory: {
		//borderWidth: 0.5,
		padding: 15,
		borderRadius: 30,
		//elevation: 0.01,
		alignSelf: 'center',
	},
});
