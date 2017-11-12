import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

import { Activities } from '../../../api/activities.js';
import { Categories } from '../../../api/categories.js';

import DisplayCats from '../categories/DisplayCats.jsx';

// Add and edit new lists
class ActivityCheckbox extends Component {
  // set the initial values of component states
	constructor (props) {
		super(props);

    var index = this.props.checkedArray.indexOf(this.props.activity._id);
    if(index !== -1){
			selected = true;
		} else {
			selected = false;
		}

		this.state = {
			isChecked: selected
		}
	}

  changeChecked() {
    const checked = this.state.isChecked;

    this.props.addActToArray(this.props.activity._id, checked);
    this.setState({
			isChecked: !checked
		});
  }

  renderCategories(){
    //console.log(this.props.activity.categories);
    //console.log(this.props.activity);
    return this.props.activity.categories.map((actCatId, index) => (
			<DisplayCats
				key={index}
				catId={actCatId}
				subCatIds={this.props.activity.subCategories}
			/>
		));
	}

  render() {
    //console.log(this.props.activity);
    return (
      <span>
        <input
          type='checkbox'
          value={this.props.activity._id}
          checked={this.state.isChecked}
          onChange={this.changeChecked.bind(this)}
        />
        {this.props.activity.name} . .
        {this.props.activity.description} . .
        lat: {this.props.activity.position.lat} . .
        lng: {this.props.activity.position.lng} . .
        {this.renderCategories()}
      </span>
    );
  }
}
ActivityCheckbox.PropTypes = {
	activity: PropTypes.object.isRequired,
};
// this is getting database data for props
export default createContainer(() => {
	Meteor.subscribe('categories');

	return {
		categories: Categories.find({ 'type': 'activity' }).fetch()
	};
}, ActivityCheckbox);
