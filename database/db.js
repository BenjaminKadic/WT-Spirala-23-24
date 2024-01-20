const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt24", "root", "password", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import modela
db.Nekretnina = require(__dirname + '/nekretnina.js')(sequelize, Sequelize);
db.Korisnik = require(__dirname + '/korisnik.js')(sequelize, Sequelize);
db.Upit = require(__dirname + '/upit.js')(sequelize, Sequelize);

// relacije
db.Nekretnina.hasMany(db.Upit, { foreignKey: 'NekretninaId' });
db.Upit.belongsTo(db.Nekretnina, { foreignKey: 'NekretninaId' });
db.Korisnik.hasMany(db.Upit, { foreignKey: 'KorisnikId' });
db.Upit.belongsTo(db.Korisnik, { foreignKey: 'KorisnikId' });

module.exports = db;
