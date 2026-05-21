const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  reviewerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "reviews",
  timestamps: true,
});

module.exports = Review;
