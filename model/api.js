let Sequelize = require('sequelize');
let sql = new Sequelize('postgres://localhost:5432/apitoken');



let apiSchema = {
	name: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	key: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	}
};

let apiConfig = {
	classMethods : {
		getWitAi: function (){
			return this.findOne({
				where : {
					name: 'witai'
				}
			});
		},
		getGoogleGeo: function(){
			return this.findOne({
				where : {
					name: 'googlegeocoding'
				}
			});
		},
		getGoogleTimeZone : function(){
			return this.findOne({
				where : {
					name: 'googletimezone'
				}
			});
		},
		getSlackToken : function(){
			return this.findOne({
				where : {
					name: 'slacktoken'
				}
			});
		},

		getDarkSkyToken: function(){
			return this.findOne({
				where: {
					name: 'darkskytoken'
				}
			})
		}
	}
};

module.exports = sql.define('api', apiSchema, apiConfig);











