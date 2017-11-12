//add libraries
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

// add api's
import { Activities } from '../../api/activities.js';
import { Categories } from '../../api/categories.js';
import { Lists } from '../../api/lists.js';

// Add and edit new activities
class AdminSearch extends Component {
  search(event){
      event.preventDefault();

      this.props.updateSearchState(event.target.value, this.props.searchType);
  }

  render(){
    return(
      <div className="admin-search-bar">
        <input
          type="text"
          value={this.props.searchValue}
          onChange={this.search.bind(this)}
          placeholder="Seach Activities"
        />
      </div>

    );
  }
}//end AdminSearch

// this is prop validation
AdminSearch.PropTypes = {
	activities: PropTypes.object.isRequired,
	category: PropTypes.object.isRequired,
  lists: PropTypes.object.isRequired,
};
// this is getting database data for props
export default createContainer(() => {
	Meteor.subscribe('activities');
	Meteor.subscribe('categories');
  Meteor.subscribe('lists');

	return {
		activities: Activities.find({}).fetch(),
		category: Categories.find({ 'type': 'activity' }).fetch()
	};
}, AdminSearch);
