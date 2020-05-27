'use strict';
module.exports = (sequelize, DataTypes) => {
  const userToken = sequelize.define('userToken', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(768),
      allowNull: false,
    },
  }, {
    indexes:[
      {
        unique: false,
        fields:['token']
      }
     ]
  });
  userToken.associate = function(models) {
    // associations can be defined here
    userToken.belongsTo(models.user);
  };
  return userToken;
};
