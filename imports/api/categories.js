import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Categories = new Mongo.Collection('categories');

if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish('categories', function categoriesPublication() {
		return Categories.find();
	});
}

Meteor.methods({
	'categories.insert'(name, type){
		check(name, String);
		check(type, String);

		Categories.insert({
			name,
			type,
			subCategories: [],
			createdAt: new Date()
		});
	},
	'categories.delete'(id) {
		check(id, String);

		Categories.remove(id);
	},
	'categories.insertSubCat'(subCatId, name, catId){
		check(subCatId, String);
		check(name, String);
		check(catId, String);

		Categories.update(
			{ _id: catId },
			{ $push: { subCategories: { _id: subCatId, name: name, catId: catId, createdAt: new Date()} } },
			{ $set: { updatedAt: new Date() } }
		);
	},
	'categories.deleteSubCat'(catId, subCatId){
		check(catId, String);
		check(subCatId, String);

		Categories.update(
			{ _id: catId },
			{ $pull: { subCategories: { _id: subCatId } } },
			{ $set: { updatedAt: new Date() } }
		);
	},
	'categories.updateName'(id, name){
		check(id, String);
		check(name, String);

		Categories.update(
			{ _id: id },
			{ $set: { name: name } }
		);
	},
	'categories.updateSubCatName'(catId, subCatId, newName){
		check(catId, String);
		check(subCatId, String);
		check(newName, String);

		Categories.update(
			{
				'_id': catId,
				'subCategories._id': subCatId
			},
			{
				$set: {
					'subCategories.$.name': newName,
					'subCategories.$.updatedAt': new Date()
				}
			}
		);
	}
});
