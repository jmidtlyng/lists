import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

import { Categories } from '../../../api/categories.js';
import { Activities } from '../../../api/activities.js';
import { Lists } from '../../../api/lists.js';

import DisplayCats from '../categories/DisplayCats.jsx';

import { GoogleMapLoader, GoogleMap, Marker, SearchBox } from "react-google-maps";
import { triggerEvent } from "react-google-maps/lib/utils";

// SingleActivity component - represents a single activity
export default class SingleActivity extends Component {
  renderCats() {
    return this.props.activity.categories.map((actCatId, index) => (
      <DisplayCats
        key={index}
        catId={actCatId}
        subCatIds={this.props.activity.subCategories}
      />
    ));
  }

  render() {
    return(
      <span>
        {this.props.activity.name} . . .
        {this.props.activity.description} . . .
        lat: {this.props.activity.position.lat} . .
        lng: {this.props.activity.position.lng} . .
        {this.renderCats()}
      </span>
    );
  }
}

SingleActivity.PropTypes = {
	// This component gets the activity to display through a React prop.
	list: PropTypes.object.isRequired,
	categories: PropTypes.object.isRequired
}
export default createContainer(() => {
	Meteor.subscribe('lists');
	Meteor.subscribe('categories');

	return {
		categories: Categories.find({ 'type': 'list' }).fetch()
	};
}, SingleActivity);
