const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Upit = sequelize.define('Upit', {
        tekst_upita: Sequelize.STRING,
      },{
        tableName: 'Upit', 
      });
    return Upit;
};
