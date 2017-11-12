//add libraries
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

// add api's
import { Activities } from '../../../api/activities.js';
import { Categories } from '../../../api/categories.js';

// add components
import EditActivity from './EditActivity.jsx';
import CategoryCheckbox from '../categories/CategoryCheckbox.jsx';
import AddCategory from '../categories/AddCategory.jsx';
import AdminSearch from '../AdminSearch.jsx';
import AddActivity from './AddActivity.jsx';

//add google maps
import { GoogleMapLoader, GoogleMap, Marker, SearchBox } from "react-google-maps";
import { triggerEvent } from "react-google-maps/lib/utils";


// Add and edit new activities
class AdminActivities extends Component {
	constructor (props) {
		super(props);

		this.state = {
			selectedCats: [],
			selectedSubCats: [],
			editActId: [],
			actSearchVal: "",
			actSearchTypes: {
				name: true,
				description: false,
				category: false
			},
			actSearchResultsStart: 0,
			actSearchResultsInc: 10,
			actSearchResultsIncSwap: 20,
			catSearchVal: "",
			listSearchVal: "",
			position: { lat: 40.00, lng: -100.00 },
			marker: {},
			bounds: null
		}
	}

	// gets all form data from fields and adds it to the database as an activity
	submitNewActivity(event) {
		event.preventDefault();

		// Find the text field via the React ref
		const name = ReactDOM.findDOMNode(this.refs.nameInput).value.trim();
		const description = ReactDOM.findDOMNode(this.refs.descriptionInput).value.trim();
		// add a const for each category here, or refactor somehow to clean up getting each category and then pushing values into the array where checked
		const categories = this.state.selectedCats;
		const subCategories = this.state.selectedSubCats;

		// if user has chosen a position, get the value of position state. Otherwise set lat and lng to null
		if(this.state.marker){
			var position = this.state.position;
		} else {
			var position = { lat: null, lng: null};
		}

		const logSubmission = [name, description, position, categories, subCategories];

		//console.log(logSubmission);

		Meteor.call('activities.insert', name, description, position, categories, subCategories);

		this.setState({
			selectedCats: [],
			selectedSubCats: [],
			position: { lat: 40.00, lng: -100.00 },
			marker: {}
		});

		// Clear form
		ReactDOM.findDOMNode(this.refs.nameInput).value = '';
		ReactDOM.findDOMNode(this.refs.descriptionInput).value = '';
	}

	updateSearchState(newSearch, searchType){
		if(searchType === "activity"){
			this.setState({actSearchVal: newSearch});
		} else if(searchType === "category") {
			this.setState({catSearchVal: newSearch});
		} else {
			this.setState({listSearchVal: newSearch});
		}
		//var test = Meteor.call('activities.searchByName' , this.state.searchValue);
		//console.log("my search is: " + test);
	}

	getLatLon(event) {
	//	console.log(event.latLng.lat() + ' ' + event.latLng.lng());
		this.setState({position: {lat: event.latLng.lat(), lng: event.latLng.lng() }} );

		let { marker } = this.state;
    marker = update(marker, {
      $set:
        {
          position: event.latLng,
          defaultAnimation: 4,
          key: Date.now(), // Add a key property for: http://fb.me/react-warning-keys
        },
    });
    this.setState({ marker });
	} // end getLatLon function


	handlePlacesChanged() {
		const places = this.refs.searchBox.getPlaces();
    const markers = [];

		//console.log("it's happening!!");

    // Add a marker for each place returned from search bar
    places.forEach(function (place) {
      markers.push({
        position: place.geometry.location,
      });
    });
    // Set markers; set map center to first search result
    const mapCenter = markers.length > 0 ? { lat: markers[0].position.lat(), lng: markers[0].position.lng() }: this.state.position;

    this.setState({
      position: mapCenter,
			marker: markers[0]
    });
	}

	removeMarker(){
		this.setState({
			marker: {}
		});
	}

	updateActEditArray(actId) {
		var index = this.state.editActId.indexOf(actId);
		if(index !== -1){
			this.state.editActId.splice(index, 1);
		} else {
			this.state.editActId.push(actId);
		}
	}

	updateActStart(event){
		event.preventDefault();
		var start = event.target.value;
		this.setState({
			actSearchResultsStart: start
		});
	}

	updateActInc(event){
		event.preventDefault();
		// Replace displayed activities count increment value with the other option
		// Then set the alternate option to whatever the increment value was originally
		const newInc = this.state.actSearchResultsIncSwap;
		const newSwap = this.state.actSearchResultsInc;
		this.setState({
			actSearchResultsInc: newInc,
			actSearchResultsIncSwap: newSwap
		});
	}

	// Render each activity, which can then be edited
	renderActivities() {
		//console.log(this.state.actSearchTypes);
		/* set a counter to tell when there are too many activities and there needs
		to be a new group */
		var counter = 0;
		// Make an array to hold values for buttons which toggle the next group of results
		var nextGroupArray = [];
		// An array for all of the search results
		var searchResultsArray = [];
		/* get the starting point for which activity to display. Need to use parseInt
		because the state value defaults to a string */
		var startPoint = parseInt(this.state.actSearchResultsStart);
		/* get the max for a single "page" of results. Need to use parseInt
		because the state value defaults to a string */
		var endPoint = startPoint + parseInt(this.state.actSearchResultsInc);
		// Go through all activities
		let actSearchResults = this.props.activities.map((actData) => {
			// initializing as false because no search results are found yet
			var catMatchExists = false;
			// check if the user is searching by category name
			if(this.state.actSearchTypes.category) {
				// cycle through all categories for the activity
				let catFilter = this.props.actCategories.map((catData) => {
					// Check if the search string is within a category name
					if(catData.name.toLowerCase().indexOf(this.state.actSearchVal.toLowerCase()) !== -1){
						// if a category contains the name check if that category ID is in the activity
						if(actData.categories.indexOf(catData._id) !== 1){
							// if there is a match set this variable to true to reflect a match exists
							catMatchExists = true;
						}
					}
				});
				// run the forEach/map
				catFilter;
			}
			// Check if each search type has been selected
			// Check if the search string is within an activity name or description string
			if (
					(
						this.state.actSearchTypes.name
						&& actData.name.toLowerCase().indexOf(this.state.actSearchVal.toLowerCase()) !== -1
					)
					|| (
						this.state.actSearchTypes.description
						&& actData.description.toLowerCase().indexOf(this.state.actSearchVal.toLowerCase()) !== -1
					)
					|| catMatchExists) {
				// add value to array
				searchResultsArray.push(actData);
			}
		});
		/*
			cycle all search results
			if within start point and end point display normal value UNLESS
				if within start and end points and final value display end buttons
			if checked display normal value
				if checked and final value, display end buttons
			if greater than end point, increment counter
		*/
		let printSearchResults = searchResultsArray.map((actData) => {
			// check if the loop is between the starting and ending values
			if(counter >= startPoint && counter < endPoint){
				// increment the counter
				counter ++;
				// if rendering the last activity also render the group buttons here
				if( counter === searchResultsArray.length ) {
					// return the activity and group buttons
					return (
						<span key={actData._id}>
							<EditActivity
								key={actData._id}
								activity={actData}
								updateActEditArray={this.updateActEditArray.bind(this)}
							/>
							<br />
							{this.renderActGroupButtons(counter, nextGroupArray)}
						</span>
					);
				} else {
					// return the activity
					return (
						<EditActivity
							key={actData._id}
							activity={actData}
							updateActEditArray={this.updateActEditArray.bind(this)}
						/>
					);
				}
			} else if(counter % this.state.actSearchResultsInc === 0) {
				// button value into a variable for rendering
				let nextGroup = counter;
				// increment the counter
				counter ++;
				/* add the nextGroup to an array which will go to the next group component
				in the last iteration of this for */
				nextGroupArray.push(nextGroup);
			} else {
				// increment the counter
				counter ++;
			}
			/* if the system has cycled through all activities display buttons to toggle
			the group to be displayed */
			if ( counter === searchResultsArray.length ) {
				return(
					<span key={counter}>
						{ this.renderActGroupButtons(counter, nextGroupArray) }
					</span>
				);
			}
		});

		actSearchResults;
		return printSearchResults;
	}

	renderActGroupButtons(counter, nextGroupArray) {
		// cycle through all of the values in the array and make a button
		let printNextButton = nextGroupArray.map((nextGroup, index) => {
			// set the end bound of the next group
			let followingGroup = nextGroup + this.state.actSearchResultsInc;
			// return a button that displays the next range of activities
			// devided by the max incrementer range
			return(
				<span key={index}>
					<button
						value={nextGroup}
						onClick={this.updateActStart.bind(this)}
					>{nextGroup} - {followingGroup}</button>
				</span>
			)
		});
		return printNextButton;
	}

	// render each category, which can then be selected
	renderCategoryCheckboxes() {
		return this.props.categories.map((category) => (
			<CategoryCheckbox
				key={category._id}
				category={category}
				updateCatState={this.updateCatState.bind(this)}
				updateSubCatState={this.updateSubCatState.bind(this)}
				selectedCats={this.state.selectedCats}
				selectedSubCats={this.state.selectedSubCats}
				ref="categoryCheckboxes"
			/>
		));
	}



	// The new activity form which calls categories
	render() {
		return (
			<div className="admin-activities">
				<h2>Activities</h2>
				<AddActivity />
				<div className="activity-search-bar">
						<AdminSearch
							searchType="activity"
							searchValue={this.state.actSearchVal}
							updateSearchState={this.updateSearchState.bind(this)}
						/>
				</div>

				<ul>
					{this.renderActivities()}
				</ul>
				<br/>
				<p>End of activity component. Start category component</p>
				<br/>
				<div>
					<AddCategory
						catType="activity"
					/>
				</div>
			</div>
		);
	}
}
// this is prop validation
AdminActivities.PropTypes = {
	activities: PropTypes.object.isRequired,
	categories: PropTypes.object.isRequired,
};
// this is getting database data for props
export default createContainer(() => {
	Meteor.subscribe('activities');
	Meteor.subscribe('categories');

	return {
		activities: Activities.find({}).fetch(),
		categories: Categories.find({ 'type': 'activity' }).fetch()
	};
}, AdminActivities);
