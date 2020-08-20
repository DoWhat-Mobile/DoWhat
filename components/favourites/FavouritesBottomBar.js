import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../assets/colors';

/**
 * Bottom tab dynamic tab of favourites list, shown when user is adding favourites for planning
 */
const FavouritesBottomBar = ({
	anyFavouritesClicked,
	favouriteSummaryModalVisible,
	setFavouriteSummaryModalVisible,
	numberOfFavouritesClicked,
	handleDoneSelectingFavourites,
}) => {
	if (!anyFavouritesClicked) return null;

	return (
		<View style={{ opacity: 100 }}>
			{favouriteSummaryModalVisible ? null : ( // Show opening arrow when modal is not visible
				<Badge
					value={<MaterialCommunityIcons name='chevron-up' color={'white'} size={28} />}
					badgeStyle={{
						backgroundColor: '#cc5237',
						paddingTop: 15,
						paddingBottom: 15,
						borderTopLeftRadius: 10,
						borderTopRightRadius: 10,
						borderWidth: 0,
					}}
					onPress={() => setFavouriteSummaryModalVisible(true)}
					containerStyle={{
						position: 'relative',
						top: 5,
						right: -100,
					}}
				/>
			)}

			{numberOfFavouritesClicked == 3 ? ( // error message when max number of events clicked
				<Text
					style={{
						position: 'absolute',
						marginTop: 5,
						marginLeft: 20,
						color: 'red',
						fontWeight: '600',
					}}
				>
					Maximum number of events added
				</Text>
			) : null}

			<View
				style={[
					styles.summaryCartBottomContainer,
					favouriteSummaryModalVisible
						? {
								borderTopLeftRadius: 0,
								borderTopRightRadius: 0,
								borderTopWidth: 0.2,
								borderTopColor: 'white',
						  }
						: {},
				]}
			>
				<Text
					style={{
						textAlign: 'center',
						color: 'white',
						justifyContent: 'center',
						fontWeight: 'bold',
						fontSize: 14,
						marginTop: 3,
						marginLeft: 10,
					}}
				>
					{numberOfFavouritesClicked} | Use events for plan
				</Text>

				<TouchableOpacity
					onPress={handleDoneSelectingFavourites}
					style={{
						padding: 5,
						backgroundColor: 'white',
						borderRadius: 5,
					}}
				>
					<MaterialCommunityIcons name='greater-than' color={'black'} size={16} />
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default FavouritesBottomBar;

const styles = StyleSheet.create({
	summaryCartBottomContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
		borderRadius: 5,
		marginLeft: '5%',
		marginRight: '5%',
		backgroundColor: '#cc5237',
	},
});
