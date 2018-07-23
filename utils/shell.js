const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('database.db');
var Job = require('../models/job');
var User = require('../models/user');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/joblana');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

function db_transfer(ref_id){
	cmmnd = "SELECT * FROM JOBLISTINGS"
	db.all(cmmnd, (err, ary) => {
		User.findOne({"email": "deveshaggrawal19@gmail.com"}, (err, user) => {
			lst = [];
			ary.forEach(item => {
				let job = new Job({
					recruiter: user._id,
					contact: {
						email: item.email, 
						phoneno: item.contactno
					},
					company: {
						name: item.companyname, 
						about: item.aboutcompany, 
						location: item.location, 
						website: item.companywebsite, 
					},
					job: {
						title: item.jobtitle,
						description: item.jobdesc,
						vacancies: parseInt(item.noofvac),
						location: item.location,
					}
				});
				if (item.experience == "e12") job.experience = 12;
				else if (job.experience == "e24") job.experience = 24;
				else job.experience = 0;
				if (item.salary.includes('-')){
					pri = item.salary.split('-');
					job.salary = {min: parseInt(pri[0]), max: parseInt(pri[1])};
				}
				else {
					job.salary = {max: parseInt(item.salary)};
				}
				if (item.jobdesc.includes('')){
					description = 
				}
				lst.push(job);
			});
			lst.forEach(item => {
				item.save();
			})
		});
		
	})
}

module.exports.db_transfer = db_transfer