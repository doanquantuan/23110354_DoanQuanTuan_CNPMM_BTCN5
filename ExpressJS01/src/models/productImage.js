const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductImage = sequelize.define("ProductImage", {
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
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  tableName: "product_images",
  timestamps: true,
});

module.exports = ProductImage;
