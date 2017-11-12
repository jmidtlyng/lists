import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

import { Categories } from '../../../api/categories.js';
import { Activities } from '../../../api/activities.js';
import { Lists } from '../../../api/lists.js';

import CategoryCheckbox from '../categories/CategoryCheckbox.jsx';
import ActivityCheckbox from '../activities/ActivityCheckbox.jsx';
import DisplayCats from '../categories/DisplayCats.jsx';
import SingleActivity from '../activities/SingleActivity.jsx';
import Checkbox from '../Checkbox.jsx';
import AdminSearch from '../AdminSearch.jsx';

// EditActivity component - represents a single todo item
export default class EditList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editing: false,
			selectedCats: [],
			selectedSubCats: [],
			selectedActs: [],
			actSearchVal: "",
			catSearchVal: "",
			actSearchTypes: {
				name: true,
				description: false,
				category: false
			},
			actSearchResultsStart: 0,
			actSearchResultsInc: 10,
			actSearchResultsIncSwap: 20
		};

		var loadCategories = this.props.list.categories.map((category) => {
			this.state.selectedCats.push(category);
		});
		var loadSubCategories = this.props.list.subCategories.map((subCategory) => {
			this.state.selectedSubCats.push(subCategory);
		});
		var loadActivities = this.props.list.activities.map((activity) => {
			this.state.selectedActs.push(activity);
		});

		loadCategories;
		loadSubCategories;
		loadActivities;
	}

	toggleEdit() {
		// Set the activity to edit
		this.setState({
			editing: !this.state.editing
		});
		this.props.updateListEditArray(this.props.list._id);
	}

	saveEdit(event){
		event.preventDefault();

		const name = ReactDOM.findDOMNode(this.refs.nameEdit).value.trim();
		const description = ReactDOM.findDOMNode(this.refs.descriptionEdit).value.trim();
		const position = ReactDOM.findDOMNode(this.refs.positionEdit).value.trim();
		const catArray = this.state.selectedCats;
		const subCatArray = this.state.selectedSubCats;
		const actArray = this.state.selectedActs;
		const id = this.props.list._id;

		if(position) {
			Meteor.call('lists.updatePosition', id, position);
		}

		if(name){
			Meteor.call('lists.updateName', id, name);
		}

		if(description){
			Meteor.call('lists.updateDescription', id, description);
		}
		// No if statement because system pulls from the state every time
		Meteor.call('lists.updateCats', id, catArray, subCatArray);
		Meteor.call('lists.updateActs', id, actArray);
		// The system stops displaying edit mode
		this.toggleEdit();
	}

	updateSelectedActs(actId, checked){
		var selectedActs = this.state.selectedActs;

		if(!checked) {
			selectedActs.push(actId);
		} else {
			var index = this.state.selectedActs.indexOf(actId);
			selectedActs.splice(index, 1);
		}
		//console.log(this.state.selectedActs);
	}

	updateActStart(event){
		event.preventDefault();
		var start = event.target.value;
		this.setState({
			actSearchResultsStart: start
		});
	}

	// when categories are selected, this updates the array
	// which will be entered as the categories when an edit is submitted
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
	// which will be entered as the subcategories when an edit is submitted
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

	// When the user submits an edit this checks if there are categories or
	// removed from the database. If there are categories in the array,
	// it will remove them if they don't have matches in the db
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
			console.log(id);
			if(id === catId) {
				this.state.selectedCats.splice(index, 1);
			}
		});

		cleanUpSubCat;
		cleanUpCat;

		//console.log("clean cat array " + this.state.selectedCats);
		//console.log("clean cat array " + this.state.selectedSubCats);
	}

	// When the user submits an edit this checks if there are subcategories or
	// removed from the database. If there are subcategories in the array,
	// it will remove them if they don't have matches in the db
	cleanUpSubCatArray(id) {
		let cleanUp = this.state.selectedSubCats.map((subCatId, index) => {
			if(id === subCatId) {
				this.state.selectedSubCats.splice(index, 1);
			}
		});
		cleanUp;
		//console.log("clean subcat array " + this.state.selectedSubCats);
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

	deleteList(event){
		event.preventDefault();

		const id = this.props.list._id;

		Meteor.call('lists.delete', id);
	}

	updateSelection(type, id, isChecked){
		var selectedActs = this.state.selectedActs;
		if(type === "activity"){
			if(!isChecked) {
				this.state.selectedActs.push(id);
			} else {
				var index = this.state.selectedActs.indexOf(id);
				this.state.selectedActs.splice(index, 1);
			}
		} else if(type === "category"){
			if(!isChecked) {
				this.state.selectedCats.push(id);
			} else {
				var index = this.state.selectedCats.indexOf(id);
				this.state.selectedCats.splice(index, 1);
			}
		} else if(type === "subCategory"){
			if(!isChecked) {
				this.state.selectedActs.push(id);
			} else {
				var index = this.state.selectedActs.indexOf(id);
				this.state.selectedActs.splice(index, 1);
			}
		}
		//console.log(this.state.selectedActs);
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

	// display all activities that match search criteria
	renderActCheckboxes() {
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
			// Setting a variable to find if the activity has been selected so its not filtered out
			let isChecked = (this.state.selectedActs.indexOf(actData._id) !== -1);
			// Check if each search type has been selected
			// Check if the search string is within an activity name or description string
			if (
				(
					(
						this.state.actSearchTypes.name
						&& actData.name.toLowerCase().indexOf(this.state.actSearchVal.toLowerCase()) !== -1
					)
					|| (
						this.state.actSearchTypes.description
						&& actData.description.toLowerCase().indexOf(this.state.actSearchVal.toLowerCase()) !== -1
					)
					|| catMatchExists
				)
			|| isChecked) {
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
			// Setting a variable to find if the activity has been selected so its not filtered out
			let isChecked = (this.state.selectedActs.indexOf(actData._id) !== -1);
			// check if the loop is between the starting and ending values
			if(counter >= startPoint && counter < endPoint){
				// increment the counter
				counter ++;
				// if rendering the last activity also render the group buttons here
				if( counter === searchResultsArray.length ) {
					// return the activity and group buttons
					return (
						<li className="admin-list-activity" key={actData._id}>
							<ActivityCheckbox
								key={actData._id}
								activity={actData}
								checkedArray={this.state.selectedActs}
								addActToArray={this.updateSelectedActs.bind(this)}
							/>
							<br />
							{this.renderActGroupButtons(counter, nextGroupArray)}
						</li>
					);
				} else {
					// return the activity
					return (
						<li className="admin-list-activity" key={actData._id}>
							<ActivityCheckbox
								key={actData._id}
								activity={actData}
								checkedArray={this.state.selectedActs}
								addActToArray={this.updateSelectedActs.bind(this)}
							/>
						</li>
					);
				}
			} else if(isChecked){
				if(counter % this.state.actSearchResultsInc === 0) {
					// button value into a variable for rendering
					let nextGroup = counter;
					/* add the nextGroup to an array which will go to the next group component
					in the last iteration of this for */
					nextGroupArray.push(nextGroup);
				}
				// increment the counter
				counter ++;
				// if at the end and checked show group buttons
				if( counter === searchResultsArray.length ) {
					// return the activity and group buttons
					return (
						<li className="admin-list-activity" key={actData._id}>
							<ActivityCheckbox
								key={actData._id}
								activity={actData}
								checkedArray={this.state.selectedActs}
								addActToArray={this.updateSelectedActs.bind(this)}
							/>
							<br />
							{this.renderActGroupButtons(counter, nextGroupArray)}
						</li>
					);
				} else {
					// return the activity
					return (
						<li className="admin-list-activity" key={actData._id}>
							<ActivityCheckbox
								key={actData._id}
								activity={actData}
								checkedArray={this.state.selectedActs}
								addActToArray={this.updateSelectedActs.bind(this)}
							/>
						</li>
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

	// For each category in the list document, go through each category in the db
	// to find the category ID that matches. Then display the category name.
	renderCats(){
		return this.props.list.categories.map((listCatId, index) => (
			<DisplayCats
				key={index}
				catType="list"
				catId={listCatId}
				subCatIds={this.props.list.subCategories}
			/>
		));
	}

	renderActs(catId) {
		let showActs = this.props.list.activities.map((listActId) => {
			let matchActIds = this.props.activities.map((actData) => {
				if(listActId === actData._id){
					return (
						<li>
							<SingleActivity
								key={listActId._id}
								activity={actData}
							/>
						</li>
					);
				}
			});
			return matchActIds;
		});
		return showActs;
	}

	render() {
		// Give activities a different className when they are being edited
		// so we can style them in CSS

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
							placeholder={this.props.list.name}
						/>
						<textarea
							form="new-activity"
							ref="descriptionEdit"
							placeholder={this.props.list.description}
						/>
						<input
							type="text"
							ref="positionEdit"
							placeholder={this.props.list.position}
						/>
						<button className="delete-activity" onClick={this.deleteList.bind(this)}>
							Delete
						</button>
						<div className="category-checkboxes">
							<strong>Categories:</strong>
							{this.renderCategoryCheckboxes()}
						</div>
						<u>Select Activities</u>
						<div className="activity-search-bar">
								<AdminSearch
									searchType="activity"
									searchValue={this.state.actSearchVal}
									updateSearchState={this.updateSearchState.bind(this)}
								/>
						</div>

						<ul>
							{this.renderActCheckboxes()}
						</ul>
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

					<span className="list-details">
						{this.props.list.name} . .
						{this.props.list.description} . .
						location: {this.props.list.position} . .
						{this.renderCats()}
						<div>
							<ul>
								{this.renderActs()}
							</ul>
						</div>
					</span>

				</li>
			);
		}
	}
}

EditList.PropTypes = {
	// This component gets the activity to display through a React prop.
	list: PropTypes.object.isRequired,
	categories: PropTypes.object.isRequired
}
export default createContainer(() => {
	Meteor.subscribe('lists');
	Meteor.subscribe('categories');
	Meteor.subscribe('activities');

	return {
		categories: Categories.find({ 'type': 'list' }).fetch(),
		activities: Activities.find({}).fetch()
	};
}, EditList);
