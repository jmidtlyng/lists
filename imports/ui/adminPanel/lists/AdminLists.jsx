import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

import { Activities } from '../../../api/activities.js';
import { Categories } from '../../../api/categories.js';
import { Lists } from '../../../api/lists.js';

import EditList from './EditList.jsx';
import CategoryCheckbox from '../categories/CategoryCheckbox.jsx';
import AdminSearch from '../AdminSearch.jsx';
import ActivityCheckbox from '../activities/ActivityCheckbox.jsx';
import AddActivity from '../activities/AddActivity.jsx';

// Add and edit new lists
class AdminLists extends Component {
	// set the initial values of component states
	constructor (props) {
		super(props);

		this.state = {
			selectedCats: [],
			selectedSubCats: [],
			editListId: [],
			selectedActs: [],
			photos: [],
			catSearchVal: "",
			actSearchVal: "",
			listSearchVal: "",
			actSearchTypes: {
				name: true,
				description: false,
				category: false
			},
			actSearchResultsStart: 0,
			actSearchResultsInc: 10,
			actSearchResultsIncSwap: 20,
			listSearchTypes: {
				name: true,
				description: false,
				category: false
			},
			listSearchResultsStart: 0,
			listSearchResultsInc: 10,
			listSearchResultsIncSwap: 20,
			addAnAct: false,
			error: ""
		};
	}

	// gets all form data from fields and adds it to the database as an list
	submitNewList(event) {
		event.preventDefault();

		// Find the text field via the React ref
		const name = ReactDOM.findDOMNode(this.refs.nameInput).value.trim();
		const description = ReactDOM.findDOMNode(this.refs.descriptionInput).value.trim();
		const position = ReactDOM.findDOMNode(this.refs.positionInput).value.trim();
		// add a const for each category here, or refactor somehow to clean up getting each category and then pushing values into the array where checked
		const categories = this.state.selectedCats;
		const subCategories = this.state.selectedSubCats;
		const activities = this.state.selectedActs;

		// for testing if you want to make sure youre collecting the right data
		const logSubmission = [name, description, position, categories, subCategories, activities];
		// console.log(logSubmission);

		Meteor.call('lists.insert', name, description, position, categories, subCategories, activities);

		this.setState({
			selectedCats: [],
			selectedSubCats: [],
			selectedActs: []
		});

		// Clear form
		ReactDOM.findDOMNode(this.refs.nameInput).value = '';
		ReactDOM.findDOMNode(this.refs.descriptionInput).value = '';
    ReactDOM.findDOMNode(this.refs.positionInput).value = '';
	}

	// when categories are selected, this updates the array
	// which will be entered as the categories of the new activity
	updateCatState(catId, checked){
		// shorter names for the array states to be referenced later
		const catArray = this.state.selectedCats;
		const subCatArray = this.state.selectedSubCats;

		// if the checkbox was initially blank, add the catId to the state
		// consequently checking the checkbox
		// if checkbox was initially checked, remove the id from the array
		if(!checked) {
			catArray.push(catId);
		} else {
			// go through all possible categories
			let removeSubCat = this.props.listCategories.map((catData) => {
				// find the category that matches the ID
				if(catData._id === catId && catData.subCategories) {
					// go through all of the subcategories for that category to remove subcategories from the array
					let matchSubCat = catData.subCategories.map((subCatData) => {
						// find out if that subcategory is checked
						var index = subCatArray.indexOf(subCatData._id);
						// if the subcat is checked, take it out of the array
						if(index !== -1){
							subCatArray.splice(index, 1);
						}
					});
					matchSubCat;
				}
			});

			// go through all of the checked cats state array
			// if the ID matches the selected one, remove it from the state array
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
		let cleanUpSubCat = this.props.listCategories.map((catData) => {
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

	cleanUpSubCatArray(id) {
		let cleanUp = this.state.selectedSubCats.map((subCatId, index) => {
			if(id === subCatId) {
				this.state.selectedSubCats.splice(index, 1);
			}
		});
		cleanUp;
		//console.log("clean subcat array " + this.state.selectedSubCats);
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

	updateListEditArray(listId) {
		var index = this.state.editListId.indexOf(listId);
		if(index !== -1){
			this.state.editListId.splice(index, 1);
		} else {
			this.state.editListId.push(listId);
		}
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

	toggleAddAct(){
		this.setState({
			addAnAct: !this.state.addAnAct
		})
	}

	updateActSearchType(event){
		// this gets a checkbox value of name, description, or category
		var searchType = event.target.value;
		// when the selected value matches the condition, swap the selected value
		// and make sure the rest remain the same
		if(searchType === 'name'){
			this.setState({
				actSearchTypes: {
					name: !this.state.actSearchTypes.name,
					description: this.state.actSearchTypes.description,
					category: this.state.actSearchTypes.category
				}
			});
		} else if (searchType === 'description') {
			let checked = this.state.actSearchTypes.description;
			this.setState({
				actSearchTypes: {
					name: this.state.actSearchTypes.name,
					description: !this.state.actSearchTypes.description,
					category: this.state.actSearchTypes.category
				}
			});
		}  else if (searchType === 'category') {
			let checked = this.state.actSearchTypes.category;
			this.setState({
				actSearchTypes: {
					name: this.state.actSearchTypes.name,
					description: this.state.actSearchTypes.description,
					category: !this.state.actSearchTypes.category
				}
			});
		}
	}

	updateListSearchType(event){
		// this gets a checkbox value of name, description, or category
		var searchType = event.target.value;
		// when the selected value matches the condition, swap the selected value
		// and make sure the rest remain the same
		if(searchType === 'name'){
			this.setState({
				listSearchTypes: {
					name: !this.state.listSearchTypes.name,
					description: this.state.listSearchTypes.description,
					category: this.state.listSearchTypes.category
				}
			});
		} else if (searchType === 'description') {
			let checked = this.state.listSearchTypes.description;
			this.setState({
				listSearchTypes: {
					name: this.state.listSearchTypes.name,
					description: !this.state.listSearchTypes.description,
					category: this.state.listSearchTypes.category
				}
			});
		}  else if (searchType === 'category') {
			let checked = this.state.listSearchTypes.category;
			this.setState({
				listSearchTypes: {
					name: this.state.listSearchTypes.name,
					description: this.state.listSearchTypes.description,
					category: !this.state.listSearchTypes.category
				}
			});
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

	updateListInc(event){
		event.preventDefault();
		// Replace displayed activities count increment value with the other option
		// Then set the alternate option to whatever the increment value was originally
		const newInc = this.state.listSearchResultsIncSwap;
		const newSwap = this.state.listSearchResultsInc;
		this.setState({
			listSearchResultsInc: newInc,
			listSearchResultsIncSwap: newSwap
		});
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

	renderAddActModule() {
		if(this.state.addAnAct){
			return(
				<div>
					<button onClick={this.toggleAddAct.bind(this)}>
						Cancel
					</button>
					<AddActivity />
				</div>
			);
		} else {
			return(
				<button onClick={this.toggleAddAct.bind(this)}>
					Add new activity
				</button>
			);
		}
	}

	// Render each list, which can then be edited
	renderLists() {
		/*

		*/
		let listResults = this.props.lists.map((listData) => {
			return (
				<EditList
					key={listData._id}
					list={listData}
					updateListEditArray={this.updateListEditArray.bind(this)}
				/>
			);
		});
		return listResults;
	}

	// render each category, which can then be selected
	renderCategoryCheckboxes() {
		let catSearchResults = this.props.listCategories.map((catData) => {
			const isChecked = (this.state.selectedCats.indexOf(catData._id) !== -1);
			if (catData.name.toLowerCase().indexOf(this.state.catSearchVal.toLowerCase()) !== -1 || isChecked) {
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

	upload_file(event) {
        let file = event.target.files[0];
        let add_photo = this.add_photo.bind(this);

        if (file !== null) {
            let split_file = file.name.split('.');
            let file_ext = split_file[split_file.length - 1].toLowerCase();
            if (file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'png') {
                Meteor.call('sign_s3_request', file.name, file.type, function(err, res) {
                    if (err) {
                        throw err;
                    }

                    if (res && res.signed_request) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('PUT', res.signed_request);
                        xhr.setRequestHeader('x-amz-acl', 'public-read');
                        xhr.onload = () => {
                            if (xhr.status === 200) {
                                add_photo(res.final_url);
                            }
                        };

                        xhr.onerror = function(err) {
                            alert('Could not upload file.');
                        };

                        xhr.send(file);
                    }
                });
            } else {
                this.setState({error: file_ext.toUpperCase() + 's are not permitted. Please select a JPG or PNG instead.'});
            }
        }
    }

    add_photo(url) {
        let photos = this.state.photos;
        photos.push({url: url, alt: ''});
        this.setState({photos: photos});
    }

		/*
		for s3 stuf:
		<input
			type="file"
			className="room_image_upload_button"
			onChange={ this.upload_file.bind(this) }
		/>
		*/

	// The new list form which calls categories
	render() {
		if(this.state.actSearchResultsInc === 10){
			var showActs = 20;
		} else {
			var showActs = 10;
		}
		if(this.state.listSearchResultsInc === 10){
			var showLists = 20;
		} else {
			var showLists = 10;
		}
		return (
			<div className="admin-lists">
				<h2>Lists</h2>

				<form className="new-list" onSubmit={this.submitNewList.bind(this)} >
					<input
						type="text"
						ref="nameInput"
						placeholder="name"
					/>

					<br/>
					<br/>

					<textarea
						form="new-list"
						ref="descriptionInput"
						placeholder="description"
					/>

					<br/>
          <br/>

          <input
						type="text"
						ref="positionInput"
						placeholder="location"
					/>

					<br/>

					<div className="admin_subtitle">Upload Photos</div>
          <br />

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

					<u>Select Activities</u>
					<div className="activity-search-bar">
						<span className="act-search-checkboxes">
							<input
								type="checkbox"
								value='name'
								checked={this.state.actSearchTypes.name}
								onChange={this.updateActSearchType.bind(this)}
							/>
							Name
							<input
								type="checkbox"
								value='description'
								checked={this.state.actSearchTypes.description}
								onChange={this.updateActSearchType.bind(this)}
							/>
							Description
							<input
								type="checkbox"
								value='category'
								checked={this.state.actSearchTypes.category}
								onChange={this.updateActSearchType.bind(this)}
							/>
							Category
						</span>
						<AdminSearch
							searchType="activity"
							searchValue={this.state.actSearchVal}
							updateSearchState={this.updateSearchState.bind(this)}
						/>
					</div>

					<ul>
						{this.renderActCheckboxes()}
					</ul>
					<button
						value={this.state.actSearchResultsIncSwap}
						onClick={this.updateActInc.bind(this)}
					>Display {showActs}</button>
					<br/>
					<br/>

					<input
						type="submit"
						value="submit list"
					/>
				</form>
				<br/>
				<span>{this.renderAddActModule()}</span>
				<br/>
				<br/>
				<strong>Lists:</strong>
				<br/>
				<div className="list-search-bar">
					<span className="list-search-checkboxes">
						<input
							type="checkbox"
							value='name'
							checked={this.state.listSearchTypes.name}
							onChange={this.updateListSearchType.bind(this)}
						/>
						Name
						<input
							type="checkbox"
							value='description'
							checked={this.state.listSearchTypes.description}
							onChange={this.updateListSearchType.bind(this)}
						/>
						Description
						<input
							type="checkbox"
							value='category'
							checked={this.state.listSearchTypes.category}
							onChange={this.updateListSearchType.bind(this)}
						/>
						Category
					</span>
					<AdminSearch
						searchType="list"
						searchValue={this.state.listSearchVal}
						updateSearchState={this.updateSearchState.bind(this)}
					/>
				</div>
				<ul>
					{this.renderLists()}
				</ul>
				<button
					value={this.state.listSearchResultsIncSwap}
					onClick={this.updateListInc.bind(this)}
				>Display {showLists}</button>
			</div>
		);
	}
}
// this is prop validation
AdminLists.PropTypes = {
	activities: PropTypes.object.isRequired,
	actCategories: PropTypes.object.isRequired,
	listCategories: PropTypes.object.isRequired,
	lists: PropTypes.object.isRequired,
  catType: PropTypes.string.isRequired
};
// this is getting database data for props
export default createContainer(() => {
	Meteor.subscribe('activities');
	Meteor.subscribe('listCategories');
	Meteor.subscribe('actCategories');
  Meteor.subscribe('lists');

	return {
		activities: Activities.find({}).fetch(),
		listCategories: Categories.find({ 'type': 'list' }).fetch(),
		actCategories: Categories.find({ 'type': 'activity' }).fetch(),
    lists: Lists.find({}).fetch()
	};
}, AdminLists);
