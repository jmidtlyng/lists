import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Activities } from '../../api/activities.js';
import { Categories } from '../../api/categories.js';
import { Lists } from '../../api/lists.js';

import AdminActivities from './activities/AdminActivities.jsx';
import AdminLists from './lists/AdminLists.jsx';

import AddCategory from './categories/AddCategory.jsx';


// App component - represents the entire app
class AdminPanel extends Component {
  constructor (props) {
    super(props);

    this.state = {
      listAdmin: true,
      activityAdmin: false
    }
  }

  setToLists() {
    this.setState({
      activityAdmin: false
    });
    this.setState({
      listAdmin: true
    });
	}

	setToActivities() {
    this.setState({
      listAdmin: false
    });
    this.setState({
      activityAdmin: true
    });
	}

	render() {

		if (this.state.activityAdmin) {
			return (
				<div className="container">
					<button onClick={this.setToLists.bind(this)}>
						Edit Lists
					</button>
					<button onClick={this.setToActivities.bind(this)}>
						Edit Activities
					</button>
					<div>
						<AdminActivities />
					</div>
				</div>
			);
		} else if(this.state.listAdmin) {
			return (
				<div className="container">
					<button onClick={this.setToLists.bind(this)}>
						Edit Lists
					</button>
					<button onClick={this.setToActivities.bind(this)}>
						Edit Activities
					</button>
          <div>
						<AdminLists />
					</div>
					<div>
						<AddCategory catType="list"/>
					</div>
				</div>
			);
		}

	}
}
export default createContainer(() => {
	Meteor.subscribe('activities');
	Meteor.subscribe('categories');
  Meteor.subscribe('lists');

	return {
		activities: Activities.find({}).fetch(),
		categories: Categories.find({}).fetch(),
    lists: Lists.find({}).fetch()
	};
}, AdminPanel);
