const { DataTypes } = require("sequelize");

module.exports = {
  name: "20260521000001-add-views-to-products",
  up: async (queryInterface) => {
    await queryInterface.addColumn("products", "views", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("products", "views");
  },
};
