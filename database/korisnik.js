const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Korisnik = sequelize.define('Korisnik', {
        ime: Sequelize.STRING,
        prezime: Sequelize.STRING,
        username: { type: Sequelize.STRING, unique: true },
        password: Sequelize.STRING,
      },{
        tableName: 'Korisnik', 
      });
    return Korisnik;
};

