import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Categories } from '../../../api/categories.js';
import { Activities } from '../../../api/activities.js';

import SubCategoryCheckbox from './SubCategoryCheckbox.jsx';

export default class CategoryCheckbox extends Component {
	constructor(props) {
		super(props);

		var index = this.props.selectedCats.indexOf(this.props.category._id);
		if(index !== -1){
			selected = true;
		} else {
			selected = false;
		}

		this.state = {
			isChecked: selected,
		}
	}

	renderSubCategories() {
		// show subcategories if the user has checked a category
		if(this.state.isChecked && this.props.category.subCategories){
			let printSubCatCheckboxes = this.props.category.subCategories.map((subCategoryData) => {
				return ( <SubCategoryCheckbox
						key={subCategoryData._id}
						subCategory={subCategoryData}
						selectedSubCats={this.props.selectedSubCats}
						updateSubCatState={this.props.updateSubCatState}
					/> );
			});
			return (
				<ul>
					{printSubCatCheckboxes}
				</ul>
			);
		}
	}

	updateSelectedCats() {
		const checked = this.state.isChecked;

		// this  passes the event to the parent so the parent can update the state
		this.props.updateCatState(this.props.category._id, checked);
		this.setState({
			isChecked: !checked
		});
	}

	render() {
		return (
			<div>
				<input
					type="checkbox"
					ref="categoryCheckbox"
					onChange={this.updateSelectedCats.bind(this)}
					checked={this.state.isChecked}
				/>
				{this.props.category.name}
				<span>
					{this.renderSubCategories()}
				</span>
			</div>
		);
	}
}

CategoryCheckbox.PropTypes = {
	// This component gets the category to display through a React prop.
	category: PropTypes.object.isRequired,
	selectedCats: PropTypes.array.isRequired
}
