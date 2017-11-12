import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Categories } from '../../../api/categories.js';

import EditSubCategory from './EditSubCategory.jsx';

export default class AddSubCategory extends Component {

	submitNewSubCategory(event) {
		event.preventDefault();

		const name = ReactDOM.findDOMNode(this.refs.subCategoryNameInput).value.trim();

		const catId = this.props.category._id;

		const subCatId = Math.random().toString(36).substring(10);

		Meteor.call('categories.insertSubCat', subCatId, name, catId);

		ReactDOM.findDOMNode(this.refs.subCategoryNameInput).value = '';
	}

	renderSubCategories() {
		let printSubCats = this.props.category.subCategories.map((subCategoryData) => {
			return ( <EditSubCategory
				key={subCategoryData._id}
				subCategory={subCategoryData}
				cleanUpSubCatArray={this.props.cleanUpSubCatArray}
			/> );
		});
		return (
			<ul>
				{printSubCats}
			</ul>
		);
	}

	render() {
		if(!this.props.category.subCategories){
			return (
				<div>
					<strong>Sub-categories</strong>
					<form className="new-sub-category" onSubmit={this.submitNewSubCategory.bind(this)}>
						<input
							type="text"
							ref="subCategoryNameInput"
							placeholder="Sub-category name"
						/>
						<input
							type="submit"
							value="submit"
						/>
					</form>
					<ul>
						Add a sub category
					</ul>
				</div>
			);
		} else {
			return (
				<div>
					<strong>Sub-categories</strong>
					<form className="new-sub-category" onSubmit={this.submitNewSubCategory.bind(this)}>
						<input
							type="text"
							ref="subCategoryNameInput"
							placeholder="Sub-category name"
						/>
						<input
							type="submit"
							value="submit"
						/>
					</form>
					<div>
						{this.renderSubCategories()}
					</div>
				</div>
			);
		}
	}
}
AddSubCategory.PropTypes = {
	// This component gets the category to display through a React prop.
	category: PropTypes.object.isRequired,
};
