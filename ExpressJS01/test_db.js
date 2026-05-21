const db = require("./src/config/database");
const Product = require("./src/models/product");

async function check() {
  try {
    await db.sequelize.authenticate();
    console.log("DB Authenticated.");
    const products = await Product.findAll({ raw: true });
    console.log("Products in DB:");
    products.forEach(p => {
      console.log(`- ${p.id}: views = ${p.views}, category = ${p.category}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
