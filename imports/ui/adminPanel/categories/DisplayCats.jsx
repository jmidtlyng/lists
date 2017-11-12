import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

import { Categories } from '../../../api/categories.js';

// Add and edit new lists
class DisplayCats extends Component {
  printCatName() {
    matchCats =  this.props.categories.map((catData) => {
      if(this.props.catId === catData._id) {
        return (
          <span key={catData._id}>{catData.name} .. {this.renderSubCats(catData)} . .</span>
        );
      }
    });
    return matchCats;
  }

  renderSubCats(catData) {
    //console.log("this is passed: " + catData.subCategories);
    if(catData.subCategories){
      let printSubCats = catData.subCategories.map((subCatData) => {
        //console.log(subCatData.catId + ' ' + ' ' + subCatData.name + ' ' + ' ' + subCatData._id);
        index = this.props.subCatIds.indexOf(subCatData._id);
        //console.log(index !== -1);
        if(index !== -1){
          return (
            <span key={subCatData._id}>{subCatData.name}</span>
          );
        }
      });
      return printSubCats;
    }
  }

  render(){
    return(
      <span>{this.printCatName()}</span>
    );
  }
}

DisplayCats.PropTypes = {
	categories: PropTypes.object.isRequired,
}
export default createContainer(() => {
	Meteor.subscribe('categories');

	return {
		categories: Categories.find({}).fetch()
	};
}, DisplayCats);
