import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import AWS from 'aws-sdk';

export const Lists = new Mongo.Collection('lists');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('lists', function listsPublication() {
    return Lists.find();
  });
}

Meteor.methods({
  'lists.insert'(name, description, position, categories, subCategories, activities) {
		check(name, String);
		check(description, String);
		check(position, String);
		check(categories, [String]);
		check(subCategories, [String]);
    check(activities, [String]);

		Lists.insert({
			name,
			description,
			position,
			categories,
			subCategories,
      activities,
			createdAt: new Date(), // current time
		});
	},
  'lists.delete'(id) {
		check(id, String);

		Lists.remove(id);
	},
  sign_s3_request(original_filename, filetype) {
        //let user = Meteor.users.findOne(Meteor.userId());

        /*if (!user.roles || (!user.roles.master_admin && !user.roles.building_admin)) {
            throw new Meteor.Error('unauthorized', 'You are not authorized');
        }*/
        let fields = [
            {valid: Match.test(original_filename, String), err_msg: 'Invalid file name'},
            {valid: Match.test(filetype, String), err_msg: 'Invalid file type'},
        ];

        fields.forEach((field) => {
            if (!field.valid) {
                throw new Meteor.Error('invalid-field', field.err_msg);
            }
        });

        let s3 = new AWS.S3();
        let s3_bucket = 'mountain-top-investments';
        let timestamp = Math.round(new Date().getTime() / 1000);
        let filename = timestamp + '_' + original_filename.replace(/[^a-z0-9\.]/gi, '_').toLowerCase();
        let file_path = 'lists/list-imgs/' + filename;
        let s3_params = {
            Bucket: s3_bucket,
            Key: file_path,
            Expires: 120,
            ContentType: filetype,
            ACL: 'public-read',
        };

        let url = s3.getSignedUrl('putObject', s3_params);
        return {
            signed_request: url,
            final_url: 'https://' + s3_bucket + '.s3.amazonaws.com/' + file_path,
        };
    },
	'lists.updateName'(id, name) {
		check(name, String);
		check(id, String);

		Lists.update(id, {
			$set: {
				name: name
			}
		});
	},
	'lists.updateDescription'(id, description) {
		check(id, String);
		check(description, String);

		Lists.update(id, {
			$set: {
				description: description
			}
		});
	},
	'lists.updatePosition'(id, position) {
		check(id, String);
		check(position, String);

		Lists.update(id, {
			$set: {
				'position': position
			}
		});
	},
	'lists.updateCats'(id, categories, subCategories) {
		check(id, String);
		check(categories, [String]);
		check(subCategories, [String]);

		Lists.update(id, {
			$set: {
				updatedAt: new Date(), //current time
				categories: categories,
				subCategories: subCategories
			}
		});
	},
  'lists.updateActs'(id, activities){
    check(id, String);
    check(activities, [String]);

    Lists.update(id, {
      $set: {
        updatedAt: new Date(), //current time
        activities: activities,
      }
    });
  },
	'lists.pullCat'(catName){
		check(catName, String);

		Lists.update(
			{ },
			{ $pull: { categories: catName } },
			{ multi: true }
		);
	},
	'lists.pullSubCat'(subCatId){
		check(subCatId, String);

		Lists.update(
			{ },
			{ $pull: { subCategories: subCatId } },
			{ multi: true }
		);
	}
});
