import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Activities = new Mongo.Collection('activities');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('activities', function activitiesPublication() {
		return Activities.find();
	});
}

Meteor.methods({
	'activities.insert'(name, description, position, categories, subCategories) {
		check(name, String);
		check(description, String);
		check(position, Object);
		check(categories, [String]);
		check(subCategories, [String]);

		Activities.insert({
			name,
			description,
			position,
			categories,
			subCategories,
			createdAt: new Date(), // current time
		});
	},
	'activities.delete'(id) {
		check(id, String);

		Activities.remove(id);
	},
	'activities.updateName'(id, name) {
		check(name, String);
		check(id, String);

		Activities.update(id, {
			$set: {
				name: name
			}
		});
	},
	'activities.updateDescription'(id, description) {
		check(id, String);
		check(description, String);

		Activities.update(id, {
			$set: {
				description: description
			}
		});
	},
	'activities.updatePosition'(id, position) {
		check(id, String);
		check(position, Object);

		Activities.update(id, {
			$set: {
				'position': position
			}
		});
	},
	'activities.updateCats'(id, categories, subCategories) {
		check(id, String);
		check(categories, [String]);
		check(subCategories, [String]);

		Activities.update(id, {
			$set: {
				updatedAt: new Date(), //current time
				categories: categories,
				subCategories: subCategories
			}
		});
	},
	'activities.pullCat'(catId){
		check(catId, String);

		Activities.update(
			{ },
			{ $pull: { categories: catId } },
			{ multi: true }
		);
	},
	'activities.pullSubCat'(subCatId){
		check(subCatId, String);

		Activities.update(
			{ },
			{ $pull: { subCategories: subCatId } },
			{ multi: true }
		);
	}
});
