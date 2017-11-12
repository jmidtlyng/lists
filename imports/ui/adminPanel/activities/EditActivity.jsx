import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

import { Categories } from '../../../api/categories.js';
import { Activities } from '../../../api/activities.js';

import CategoryCheckbox from '../categories/CategoryCheckbox.jsx';
import DisplayCats from '../categories/DisplayCats.jsx';

import { GoogleMapLoader, GoogleMap, Marker, SearchBox } from "react-google-maps";
import { triggerEvent } from "react-google-maps/lib/utils";

// EditActivity component - represents a single todo item
export default class EditActivity extends Component {
	constructor(props) {
		super(props);
		if(this.props.activity.position.lat){
			this.state = {
				editing: false,
				selectedCats: [],
				selectedSubCats: [],
				position: this.props.activity.position,
				marker: {},
				bounds: null
			};
		} else {
			this.state = {
				editing: false,
				selectedCats: [],
				selectedSubCats: [],
				position: { lat: 40.00, lng: -100.00 },
				marker: {},
				bounds: null
			};
		}

		var loadCategories = this.props.activity.categories.map((category) => {
			const categoryState = this.state.selectedCats;
			categoryState.push(category);
		});
		var loadSubCategories = this.props.activity.subCategories.map((subCategory) => {
			const subCategoryState = this.state.selectedSubCats;
			subCategoryState.push(subCategory);
		});

		loadCategories;
		loadSubCategories;
	}

	toggleEdit() {
		// Set the activity to edit
		this.setState({
			editing: !this.state.editing
		});
		this.props.updateActEditArray(this.props.activity._id);
	}

	saveEdit(event){
		event.preventDefault();

		const name = ReactDOM.findDOMNode(this.refs.nameEdit).value.trim();
		const description = ReactDOM.findDOMNode(this.refs.descriptionEdit).value.trim();
		const categoriesArray = this.state.selectedCats;
		const subCategoriesArray = this.state.selectedSubCats;
		const id = this.props.activity._id;

		if(this.state.marker) {
			var position = this.state.position;
		} else {
			var position = { lat: null, lng: null };
		}

		if(name){
			Meteor.call('activities.updateName', id, name);
		}

		if(description){
			Meteor.call('activities.updateDescription', id, description);
		}

		Meteor.call('activities.updateCats', id, categoriesArray, subCategoriesArray);

		Meteor.call('activities.updatePosition', id, position);

		this.toggleEdit();
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
		//console.log("update cat array " + this.state.selectedSubCats);
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

	cleanUpCatArray(id) {
		let cleanUpSubCat = this.props.categories.map((catData) => {
			if(catData._id === id && catData.subCategories) {
				let matchSubCat = catData.subCategories.map((subCatData) => {
					var index = this.state.selectedSubCats.indexOf(subCatData._id);
					if(index !== -1){
						this.state.selectedSubCats.splice(index, 1);
					}
				});
				matchSubCat;
			}
		});

		let cleanUpCat = this.state.selectedCats.map((catId, index) => {
			//console.log(id);
			if(id === catId) {
				this.state.selectedCats.splice(index, 1);
			}
		});

		cleanUpSubCat;
		cleanUpCat;

		//console.log("clean cat array " + this.state.selectedCats);
		//console.log("clean cat array " + this.state.selectedSubCats);
	}

	cleanUpSubCatArray(id) {
		let cleanUp = this.state.selectedSubCats.map((subCatId, index) => {
			if(id === subCatId) {
				this.state.selectedSubCats.splice(index, 1);
			}
		});
		cleanUp;

		//console.log("clean subcat array " + this.state.selectedSubCats);
	}

	deleteActivity(event){
		event.preventDefault();

		const id = this.props.activity._id;

		Meteor.call('activities.delete', id);
	}

	renderCategoryCheckboxes(){
		return  this.props.categories.map((category) => (
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

	renderCategories(){
		return this.props.activity.categories.map((actCatId, index) => (
			<DisplayCats
				key={index}
				catId={actCatId}
				subCatIds={this.props.activity.subCategories}
			/>
		));
	}

	handlePlacesChanged() {
		const places = this.refs.searchBox.getPlaces();
    const markers = [];

		// console.log("it's happening!!");

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

	render() {
		// Give activities a different className when they are being edited
		// so we can style them in CSS

    // new React thing. The categories and activities props passed to the GoogleMap
		// loader is throwing errors because theyre meant to be interpreted by the parent
		// and the child (GoogleMapLoader) is accessing it, where it should instead consume it
		// see https://facebook.github.io/react/warnings/unknown-prop.html
		const divProps = Object.assign({}, this.props);
  	delete divProps.categories;
		delete divProps.activities;

		if(this.state.editing) {
			return (
				<li>
					<form>
						<input
							type="button"
							readOnly
							onClick={this.toggleEdit.bind(this)}
							value="Cancel"
						/>
						<input
							type="submit"
							readOnly
							onClick={this.saveEdit.bind(this)}
							value="Save"
						/>
						<input
							type="text"
							ref="nameEdit"
							placeholder={this.props.activity.name}
						/>
						<textarea
							form="new-activity"
							ref="descriptionEdit"
							placeholder={this.props.activity.description}
						/>
						<button className="delete-activity" onClick={this.deleteActivity.bind(this)}>
							Delete
						</button>
						<GoogleMapLoader
				        containerElement={
				          <div
				            {...this.props}
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
						<div className="category-checkboxes">
							<strong>Categories:</strong>
							{this.renderCategoryCheckboxes()}
						</div>
					</form>
				</li>
			);
		} else {
			return (
				<li>
					<input
						type="button"
						readOnly
						onClick={this.toggleEdit.bind(this)}
						value="Edit"
					/>

					<span className="activity-details">
						{this.props.activity.name} . .
						{this.props.activity.description} . .
						lat: {this.props.activity.position.lat} . .
						lng: {this.props.activity.position.lng} . .
						{this.renderCategories()}
					</span>

				</li>
			);
		}
	}
}

EditActivity.PropTypes = {
	// This component gets the activity to display through a React prop.
	activity: PropTypes.object.isRequired,
	categories: PropTypes.object.isRequired
}
export default createContainer(() => {
	Meteor.subscribe('activities');
	Meteor.subscribe('categories');

	return {
		categories: Categories.find({ 'type': 'activity' }).fetch()
	};
}, EditActivity);
