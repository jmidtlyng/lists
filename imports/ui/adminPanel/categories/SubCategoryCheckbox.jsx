import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { Categories } from '../../../api/categories.js';

export default class SubCategoryCheckbox extends Component {
	constructor(props) {
		super(props);

		var index = this.props.selectedSubCats.indexOf(this.props.subCategory._id);
		if(index !== -1){
			selected = true;
		} else {
			selected = false;
		}

		this.state = {
			isChecked: selected,
		}
	}
	updateSelectedSubCats() {
		const checked = this.state.isChecked;

		this.props.updateSubCatState(this.props.subCategory._id, checked);
		this.setState({
			isChecked: !checked
		});
	}

	render() {
		return (
			<span className="sub-category-item">
				{this.props.subCategory.name}
				<input
					type="checkbox"
					ref="subCategoryCheckbox"
					checked={this.state.isChecked}
					onChange={this.updateSelectedSubCats.bind(this)}
					value={this.props.subCategory._id}
				/>
			</span>
		);
	}
}

SubCategoryCheckbox.PropTypes = {
	// This component gets the category to display through a React prop.
	subCategory: PropTypes.object.isRequired,
}
