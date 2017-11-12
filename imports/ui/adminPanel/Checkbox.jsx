import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { default as update } from "react-addons-update";

export default class Checkbox extends Component {
  constructor(props) {
		super(props);

		this.state = {
			checked: this.props.isChecked
		};
  }

  updateChecked(){
    this.setState({
      checked: !this.state.checked
    });
    this.props.updateStatus(this.props.type, this.props.id, this.state.checked);
  }

  // Types are activity, list, category, & subcategory
  render () {
    return(
      <input
        type="checkbox"
        value={this.props.id}
        checked={this.state.checked}
        onChange={this.updateChecked.bind(this)}
      />
    );
  }
}
