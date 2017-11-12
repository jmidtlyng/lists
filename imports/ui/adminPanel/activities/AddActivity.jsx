//add libraries
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

// add api's
import { Activities } from '../../../api/activities.js';
import { Categories } from '../../../api/categories.js';

// add components
import CategoryCheckbox from '../categories/CategoryCheckbox.jsx';
import AdminSearch from '../AdminSearch.jsx';

//add google maps
import { GoogleMapLoader, GoogleMap, Marker, SearchBox } from "react-google-maps";
import { triggerEvent } from "react-google-maps/lib/utils";


// Add and edit new activities
class AddActivity extends Component {
	constructor (props) {
		super(props);

		this.state = {
			selectedCats: [],
			selectedSubCats: [],
			catSearchVal: "",
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

		// This removes the categories and submategories added to the state that were removed from the DB
		this.cleanUpCats();

		// add a const for each category here, or refactor somehow to clean up getting each category and then pushing values into the array where checked
		const categories = this.state.selectedCats;
		const subCategories = this.state.selectedSubCats;

		// if user has chosen a position, get the value of position state. Otherwise set lat and lng to null
		if(this.state.marker){
			var position = this.state.position;
		} else {
			var position = { lat: null, lng: null};
		}

		//const logSubmission = [name, description, position, categories, subCategories];
		//console.log("categories: " + this.state.selectedCats);
		//console.log("subCats: " + this.state.selectedSubCats);
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

	// when categories are selected, this updates the array
	// which will be entered as the categories of the new activity
	updateCatState(catId, checked){
		const catArray = this.state.selectedCats;
		const subCatArray = this.state.selectedSubCats;

		if(!checked) {
			catArray.push(catId);
		} else {
			let removeSubCat = this.props.categories.map((catData) => {
				if(catData._id === catId && catData.subCategories) {
					let matchSubCat = catData.subCategories.map((subCatData) => {
						var index = subCatArray.indexOf(subCatData._id);
						if(index !== -1){
							subCatArray.splice(index, 1);
						}
					});
					matchSubCat;
				}
			});

			let removeCat = this.state.selectedCats.map((actCatId, index) => {
				if(actCatId === catId){
					catArray.splice(index, 1);
				}
			});

			removeSubCat;
			removeCat;
		}

		this.setState({
			selectedCats: catArray,
			selectedSubCats: subCatArray
		});
		//console.log("update cat array " + this.state.selectedCats);
		//console.log("update cat array subcats " + this.state.selectedSubCats);
	}

	// when subcategories are selected, this updates the array
	// which will be entered as the subcategories of the new activity
	updateSubCatState(subCatId, checked){
		var subCatArray = this.state.selectedSubCats;

		if(!checked) {
			subCatArray.push(subCatId);
		} else {
			let removeSubCat = subCatArray.map((actSubCatId, index) => {
				if(actSubCatId === subCatId){
					subCatArray.splice(index, 1);
				}
			});
			removeSubCat;
		}

		this.setState({
			selectedSubCats: subCatArray
		});

		//console.log("update subcat array " + this.state.selectedSubCats);
	}
  /*
  To clean up deleted categories; on submission, make an array of all of the category/subcat IDs
  in the state which no longer exist in the DB. Then for each ID in the array, remove that ID from
  the state prior to passing to the DB.
  */
	cleanUpCats() {
		var unmatchedCatIds = [];
		var unmatchedSubCatIds = [];

		let cleanUpCat = this.state.selectedCats.map((catId) => {
			//console.log(catId);
			var catDbIds = [];
			let loadDbCatIds = this.props.categories.map((catData) => {
				//console.log(catData._id);
				catDbIds.push(catData._id);
			});
			loadDbCatIds;
			//console.log(catDbIds);
			if(catDbIds.indexOf(catId) === -1) {
				unmatchedCatIds.push(catId);
			}
		});

		let cleanUpSubCat = this.state.selectedSubCats.map((subCatId) => {
			//console.log(subCatId);
			var subCatDbIds = [];
			let cycleCats = this.props.categories.map((catData) => {
				let loadDbCatIds = catData.subCategories.map((subCatData) => {
					//console.log(subCatData._id);
					subCatDbIds.push(subCatData._id);
				});
				loadDbCatIds;
			});
			cycleCats;
			//console.log(subCatDbIds);
			if(subCatDbIds.indexOf(subCatId) === -1){
				unmatchedSubCatIds.push(subCatId);
			}
		});

		//console.log(unmatchedCatIds);
		//console.log(unmatchedSubCatIds);

		cleanUpSubCat;
		cleanUpCat;

		let removeLegacyCats = unmatchedCatIds.map((catId) => {
			var index = this.state.selectedCats.indexOf(catId);
			//console.log(index);
			this.state.selectedCats.splice(index, 1);
		});

		let removeLegacySubCats = unmatchedSubCatIds.map((subCatId) => {
			var index = this.state.selectedSubCats.indexOf(subCatId);
			//console.log(index);
			this.state.selectedSubCats.splice(index, 1);
		})

		removeLegacyCats;
		removeLegacySubCats;
		//console.log("clean cat array " + this.state.selectedCats);
		//console.log("clean cat array " + this.state.selectedSubCats);
	}

	updateSearchState(newSearch, searchType){
		if(searchType === "activity"){
			this.setState({actSearchVal: newSearch});
		} else if(searchType === "category") {
			this.setState({catSearchVal: newSearch});
		} else {
			this.setState({listSearchVal: newSearch});
		}
		//var test = Meteor.call('activities.searchByName' , this.state.actSearchVal);
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

	// render each category, which can then be selected
	renderCategoryCheckboxes() {
		let catSearchResults = this.props.categories.map((catData) => {
			const isChecked = (this.state.selectedCats.indexOf(catData._id) !== -1);
			if(catData.name.toLowerCase().indexOf(this.state.catSearchVal.toLowerCase()) !== -1 || isChecked) {
				return (
					<CategoryCheckbox
						key={catData._id}
						category={catData}
						updateCatState={this.updateCatState.bind(this)}
						updateSubCatState={this.updateSubCatState.bind(this)}
						selectedCats={this.state.selectedCats}
						selectedSubCats={this.state.selectedSubCats}
						ref="categoryCheckboxes"
					/>
				);
			}
		});
		return catSearchResults;
	}

	// The new activity form which calls categories
	render() {
		// new React thing. The categories and activities props passed to the GoogleMap
		// loader is throwing errors because theyre meant to be interpreted by the parent
		// and the child (GoogleMapLoader) is accessing it, where it should instead consume it
		// see https://facebook.github.io/react/warnings/unknown-prop.html
		const divProps = Object.assign({}, this.props);
  	delete divProps.categories;
		delete divProps.activities;
		
		return (
			<div className="admin-activities">
				<strong>Add an Activity</strong>

				<form className="new-activity" onSubmit={this.submitNewActivity.bind(this)} >
					<input
						type="text"
						ref="nameInput"
						placeholder="name"
					/>
					<br/>
					<br/>
					<textarea
						form="new-activity"
						ref="descriptionInput"
						placeholder="description"
					/>
					<br/>
					<GoogleMapLoader
			        containerElement={
			          <div
			            {...divProps}
			            style={{
			              height: `400px`,
										width: `400px`
			            }}
			          />
			        }
			        googleMapElement={
				          <GoogleMap
				            ref="map"
				            defaultZoom={2}
				            center= {this.state.position}
				            onClick={this.getLatLon.bind(this)}
				          >
			              return (
											<Marker {...this.state.marker}/>
											<SearchBox
												bounds={this.state.bounds}
												controlPosition={google.maps.ControlPosition.TOP_LEFT}
												onPlacesChanged={this.handlePlacesChanged.bind(this)}
												ref="searchBox"
												placeholder="Search here"
											/>
										);
				          </GoogleMap>
			        }
      		/>
					<div>
						{this.state.position.lat} {this.state.position.lng}
					</div>

					<button
						onClick={this.removeMarker.bind(this)}
					>
						Clear Lat & Lng
					</button>
					<br/>
					<strong>Categories</strong>
					<div className="category-search-bar">
						<AdminSearch
							searchType="category"
							searchValue={this.state.catSearchVal}
							updateSearchState={this.updateSearchState.bind(this)}
						/>
					</div>
					<br/>
					<div className="category-checkboxes">
						{this.renderCategoryCheckboxes()}
					</div>
					<br/>
					<input
						type="submit"
						value="submit"
					/>
				</form>
			</div>
		);
	}
}
// this is prop validation
AddActivity.PropTypes = {
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
}, AddActivity);
