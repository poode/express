'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('userTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      token: {
        type: Sequelize.STRING(768),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
      try {
        queryInterface.addIndex('userTokens', ['token'])
      } catch (error) {
        console.log('*************', error)
        queryInterface.dropTable('userTokens');
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('userTokens');
  }
};
