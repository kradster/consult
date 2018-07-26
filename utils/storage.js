const Storage = require('@google-cloud/storage');
var Config = require('../config');

const storage = new Storage({
 	projectId: Config.GOOGLE_CLOUD_SERVER.PROJECT_ID,
});

module.exports.upload_file = function(name, file, dir, callback) {
	if (!name){
		let lst = file.split('/')
		name = lst[lst.length-1];
		console.log(name);
	}
	storage.bucket(Config.GOOGLE_CLOUD_SERVER.BUCKET).upload(file, { destination: dir + "/" + name })
	.then((res) => {
		return callback(null, true);
	})
	.catch(err => {
		return callback(err, false);
	});
}
