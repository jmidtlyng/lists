import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Categories } from '../../../api/categories.js';

export default class EditSubCategory extends Component {
	constructor(props) {
		super(props);

		const ogName = this.props.subCategory.name;

		this.state = {
			editing: false,
			newName: ogName
		};
	}

	deleteSubCategory(event) {
		event.preventDefault();

		//this.props.cleanUpSubCatArray(this.props.subCategory._id);
		const subCatId = event.target.value;
		const catId = this.props.subCategory.catId;
		Meteor.call('categories.deleteSubCat', catId, subCatId);
		Meteor.call('activities.pullSubCat', subCatId);
	}

	saveEdit(event){
		event.preventDefault();

		Meteor.call('categories.updateSubCatName', this.props.subCategory.catId, this.props.subCategory._id,  this.state.newName);
	}

	toggleEdit(event) {
		event.preventDefault();

		this.setState({
			editing: !this.state.editing
		});
	}

	updateEditNameDisplay(event) {
		event.preventDefault();

		this.setState({
			newName: event.target.value
		});
	}

	render() {
		const isEditing = this.state.editing;

		if(isEditing) {
			return (
				<li>
					<form>
						<button
							type="button"
							className="edit-subcategories"
							onClick={this.toggleEdit.bind(this)}
							value={this.props.subCategory._id}
						>
							Hide
						</button>
						<input
							type="text"
							name="editNameInput"
							value={this.state.newName}
							onChange={this.updateEditNameDisplay.bind(this)}
						/>
						<input
							type="submit"
							onClick={this.saveEdit.bind(this)}
							value="Save"
						/>
						<button
							className="delete-sub-category"
							value={this.props.subCategory._id}
							onClick={this.deleteSubCategory.bind(this)}
						>
							Delete
						</button>
					</form>
				</li>
			);
		} else {
			return (
				<li>
					<span>{this.props.subCategory.name}</span>

					<button
						type="button"
						className="edit-subcategories"
						onClick={this.toggleEdit.bind(this)}
						value={this.props.subCategory._id}
					>
						Edit
					</button>
				</li>
			);
		}
	}
}
EditSubCategory.PropTypes = {
	// This component gets the category to display through a React prop.
	subCategory: PropTypes.object.isRequired,
};
