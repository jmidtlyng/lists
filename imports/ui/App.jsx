import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Activities } from '../api/activities.js';

import { Categories } from '../api/categories.js';

import AdminPanel from './adminPanel/AdminPanel.jsx';


// App component - represents the entire app
class App extends Component {

	render() {
		return (
			<AdminPanel />
		);
	}
}
export default createContainer(() => {
	Meteor.subscribe('activities');
	Meteor.subscribe('categories');

	return {
		activities: Activities.find({}).fetch(),
		categories: Categories.find({}).fetch(),
	};
}, App);
