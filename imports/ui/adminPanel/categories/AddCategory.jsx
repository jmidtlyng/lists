import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Categories } from '../../../api/categories.js';

import EditCategory from './EditCategory.jsx';
import AdminSearch from '../AdminSearch.jsx';

class AddCategory extends Component {
	constructor (props) {
		super(props);

		this.state = {
			catSearchVal: "",
			catSearchResultsStart: 0,
			catSearchResultsInc: 10,
			catSearchResultsIncSwap: 20
		}
	}

	// adding a new category to the collection
	submitNewCategory(event) {
		event.preventDefault();

		const name = ReactDOM.findDOMNode(this.refs.categoryNameInput).value.trim();

		Meteor.call('categories.insert', name, this.props.catType);

		ReactDOM.findDOMNode(this.refs.categoryNameInput).value = '';
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

	// display all categories
	renderCategories() {
		if(this.props.catType === "activity"){
			/* set a counter to tell when there are too many cats and there needs
			to be a new group */
			var counter = 0;
			// Make an array to hold values for buttons which toggle the next group of results
			var nextGroupArray = [];
			/* get the starting point for which cat to display. Need to use parseInt
			because the state value defaults to a string */
			var startPoint = parseInt(this.state.catSearchResultsStart);
			/* get the max for a single "page" of results. Need to use parseInt
			because the state value defaults to a string */
			var endPoint = startPoint + parseInt(this.state.catSearchResultsInc);
			// Go through all cats
			let catSearchResults = this.props.activityCategories.map((catData) => {
				// Check if the search string is within an cat name or description string
				if ( (catData.name.toLowerCase().indexOf(this.state.catSearchVal.toLowerCase()) !== -1)
			 	&& counter >= startPoint && counter < endPoint ) {
					// increment the counter
					counter ++;
					// if rendering the last cat also render the group buttons here
					if( counter !== this.props.activityCategories.length ) {
						// return the category
						return (
							<EditCategory
								key={catData._id}
								category={catData}
								cleanUpCatArray={this.props.cleanUpCatArray}
								cleanUpSubCatArray={this.props.cleanUpSubCatArray}
							/>
						);
					} else {
						// return the category
						return (
							<span key={counter}>
								<EditCategory
									key={catData._id}
									category={catData}
									cleanUpCatArray={this.props.cleanUpCatArray}
									cleanUpSubCatArray={this.props.cleanUpSubCatArray}
								/>
								<br />
								{this.renderCatGroupButtons(counter, nextGroupArray)}
							</span>
						);
					}

				} else if(counter % this.state.catSearchResultsInc === 0) {
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
				/* if the system has cycled through all cats display buttons to toggle
				the group to be displayed */
				if ( counter === this.props.activityCategories.length ) {
					return( <span key={counter}>{ this.renderCatGroupButtons(counter, nextGroupArray) }</span>);
				}
			});
			return catSearchResults;
		} else {
			/* set a counter to tell when there are too many cats and there needs
			to be a new group */
			var counter = 0;
			// Make an array to hold values for buttons which toggle the next group of results
			var nextGroupArray = [];
			/* get the starting point for which cats to display. Need to use parseInt
			because the state value defaults to a string */
			var startPoint = parseInt(this.state.catSearchResultsStart);
			/* get the max for a single "page" of results. Need to use parseInt
			because the state value defaults to a string */
			var endPoint = startPoint + parseInt(this.state.catSearchResultsInc);
			// Go through all list categories
			let catSearchResults = this.props.listCategories.map((catData) => {
				// Check if the search string is within an cat name or description string
				if ( (catData.name.toLowerCase().indexOf(this.state.catSearchVal.toLowerCase()) !== -1)
			 	&& counter >= startPoint && counter < endPoint ) {
					// increment the counter
					counter ++;
					// if rendering the last activity also render the group buttons here
					if( counter !== this.props.listCategories.length ) {
						// return the category
						return (
							<EditCategory
								key={catData._id}
								category={catData}
								cleanUpCatArray={this.props.cleanUpCatArray}
								cleanUpSubCatArray={this.props.cleanUpSubCatArray}
							/>
						);
					} else {
						// return the category
						return (
							<span key={counter}>
								<EditCategory
									key={catData._id}
									category={catData}
									cleanUpCatArray={this.props.cleanUpCatArray}
									cleanUpSubCatArray={this.props.cleanUpSubCatArray}
								/>
								<br />
								{this.renderCatGroupButtons(counter, nextGroupArray)}
							</span>
						);
					}

				} else if(counter % this.state.catSearchResultsInc === 0) {
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
				if ( counter === this.props.listCategories.length ) {
					return( <span key={counter}>{ this.renderCatGroupButtons(counter, nextGroupArray) }</span>);
				}
			});
			return catSearchResults;
		}
		return catSearchResults;
	}

	renderCatGroupButtons(counter, nextGroupArray) {
		// cycle through all of the values in the array and make a button
		let printNextButton = nextGroupArray.map((nextGroup, index) => {
			// set the end bound of the next group
			let followingGroup = nextGroup + this.state.catSearchResultsInc;
			// return a button that displays the next range of activities
			// devided by the max incrementer range
			return(
				<span key={index}>
					<button
						value={nextGroup}
						onClick={this.updateCatStart.bind(this)}
					>{nextGroup} - {followingGroup}</button>
				</span>
			)
		});
		return printNextButton;
	}

	updateCatStart(event){
		event.preventDefault();
		var start = event.target.value;
		this.setState({
			catSearchResultsStart: start
		});
	}

	render() {
		return (
			<div>
				<h2>Categories</h2>
				<form className="new-category" onSubmit={this.submitNewCategory.bind(this)}>
					<input
						type="text"
						ref="categoryNameInput"
						placeholder="Category name"
					/>
					<input
						type="submit"
						value="submit"
					/>
				</form>
				<div className="category-search-bar">
					<p>Search Categories: </p>
					<AdminSearch
						searchType="category"
						searchValue={this.state.catSearchVal}
						updateSearchState={this.updateSearchState.bind(this)}
					/>
				</div>
				<ul>
					{this.renderCategories()}
				</ul>
			</div>
		);
	}
}

AddCategory.PropTypes = {
	listCategories: PropTypes.array.isRequired,
	activityCategories: PropTypes.array.isRequired,
	catType: PropTypes.string.isRequired
};
export default createContainer(() => {
	Meteor.subscribe('categories');

	return {
		listCategories: Categories.find({ 'type': "list"}).fetch(),
		activityCategories: Categories.find({ 'type': 'activity'}).fetch()
	};
}, AddCategory);
