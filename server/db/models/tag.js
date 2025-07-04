'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью User
      Tag.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Связь many-to-many с моделью Transaction через TransactionTag
      Tag.belongsToMany(models.Transaction, {
        through: 'TransactionTags',
        foreignKey: 'tag_id',
        otherKey: 'transaction_id',
        as: 'transactions'
      });
    }
  }
  Tag.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true
      }
    },
    color: {
      type: DataTypes.STRING(7),
      validate: {
        is: /^#[0-9A-F]{6}$/i // Hex цвет формата #RRGGBB
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'Tags',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name', 'user_id']
      }
    ]
  });
  return Tag;
};