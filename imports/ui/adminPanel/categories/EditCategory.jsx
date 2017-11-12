import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Categories } from '../../../api/categories.js';

import AddSubCategory from './AddSubCategory.jsx';

export default class EditCategory extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editing: false,
		};
	}

	deleteCategory(event) {
		event.preventDefault();

		const id = this.props.category._id;

		//this.props.cleanUpCatArray(id);
		Meteor.call('categories.delete', id);
		Meteor.call('activities.pullCat', id);
		if(this.props.category.subCategories){
			let removeCatSubCatsFromActivities = this.props.category.subCategories.map((subCatData) => {
				Meteor.call('activities.pullSubCat', subCatData._id);
			});
			removeCatSubCatsFromActivities;
		}
	}

	saveEdit(event){
		event.preventDefault();

		const newName = ReactDOM.findDOMNode(this.refs.nameEdit).value.trim();
		const id = this.props.category._id;

		if(newName){
			Meteor.call('categories.updateName', id, newName);
		}
	}

	toggleEdit(event) {
		event.preventDefault();

		this.setState({
			editing: !this.state.editing
		});
	}

	renderAddSubCategory() {
			return(
				<AddSubCategory
					key={this.props.category._id}
					category={this.props.category}
					cleanUpSubCatArray={this.props.cleanUpSubCatArray}
				/>
			);
	}

	render() {
			if(!this.state.editing) {
				return (
					<li>
						<span className="category-details">{this.props.category.name}</span>

						<button className="edit-subcategories" onClick={this.toggleEdit.bind(this)}>
							Edit
						</button>
					</li>
				);
			} else {
				return (
					<li>
						<form>
							<button className="edit-subcategories" onClick={this.toggleEdit.bind(this)}>
								Hide
							</button>
							<input
									type="submit"
									readOnly
									onClick={this.saveEdit.bind(this)}
									value="Save"
							/>
							<input
								type="text"
								ref="nameEdit"
								placeholder={this.props.category.name}
							/>
							<button className="delete-category" onClick={this.deleteCategory.bind(this)}>
								Delete
							</button>
						</form>

						<div>
							{this.renderAddSubCategory()}
						</div>
					</li>
				);
			}
		}
}

EditCategory.PropTypes = {
	// This component gets the category to display through a React prop.
	category: PropTypes.object.isRequired
};
