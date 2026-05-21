require("dotenv").config();
const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const sequelize = new Sequelize(
  process.env.DB_NAME || "expressjs_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "123456",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false, // set to console.log to see the raw SQL queries
    timezone: "+07:00",
  }
);

// Define db export object early to solve circular dependency
const db = {
  sequelize,
};
module.exports = db;

// Register models to Sequelize instance
const User = require("../models/user");
const Product = require("../models/product");
const Review = require("../models/review");
const OrderItem = require("../models/orderItem");
const ProductImage = require("../models/productImage");

// Establish Relationships (Associations)
Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.hasMany(ProductImage, { foreignKey: "productId", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Programmatic Migration Runner
const runMigrations = async () => {
  const queryInterface = sequelize.getQueryInterface();

  // 1. Create SequelizeMeta table if it doesn't exist
  await queryInterface.createTable("SequelizeMeta", {
    name: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
  });

  // 2. Read already executed migrations
  const executedRows = await sequelize.query(
    "SELECT name FROM SequelizeMeta",
    { type: sequelize.QueryTypes.SELECT }
  );
  const executedMigrations = new Set(executedRows.map((r) => r.name));

  // 3. Scan migrations directory
  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js"))
    .sort(); // Run sequentially based on timestamp/alphabetical order

  console.log(">>> Checking for pending migrations...");

  for (const file of files) {
    if (!executedMigrations.has(file)) {
      console.log(`>>> Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));

      // Execute up
      await migration.up(queryInterface, Sequelize);

      // Record migration
      await sequelize.query(
        "INSERT INTO SequelizeMeta (name) VALUES (:name)",
        {
          replacements: { name: file },
          type: sequelize.QueryTypes.INSERT,
        }
      );
      console.log(`>>> Migration ${file} executed successfully.`);
    }
  }
  console.log(">>> All migrations are up to date.");
};

const seedProducts = async () => {
  try {
    const count = await Product.count();
    if (count === 0) {
      const initialProducts = [
        {
          id: "strawberry-shortcake",
          name: "Bánh Kem Dâu Tây Aura Signature",
          price: 320000,
          discountPercentage: 20,
          image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop",
          stock: 8,
          category: "Bánh Kem",
          description: "Chiếc bánh Signature đình đám của Aura Bakery. Được làm từ cốt bánh chiffon xốp mịn xen kẽ lớp kem sữa tươi hữu cơ ít béo, kết hợp cùng dâu tây tươi hữu cơ thu hoạch từ trang trại Đà Lạt chín mọng, ngọt lành.",
          ingredients: "Bột chiffon hảo hạng, kem tươi hữu cơ, dâu tây tươi Đà Lạt, vani hạt Madagascar, đường phèn tự nhiên.",
          views: 940,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (New)
        },
        {
          id: "chocolate-truffle",
          name: "Bánh Kem Sô-cô-la Truffle Bỉ",
          price: 360000,
          discountPercentage: 14,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop",
          stock: 5,
          category: "Bánh Kem",
          description: "Hương vị đam mê đậm đà dành cho tín đồ sô-cô-la thực thụ. Lớp nhân sô-cô-la truffle Bỉ nguyên chất 70% đắng nhẹ, béo ngậy xen kẽ giữa các lớp bánh xốp mềm ẩm mịn nướng lò hoàn hảo.",
          ingredients: "Sô-cô-la Bỉ nguyên chất 70%, kem bơ cacao Pháp, cốt bánh cacao mềm, bụi sô-cô-la trang trí.",
          views: 780,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago (Not new)
        },
        {
          id: "classic-croissant",
          name: "Bánh Croissant Bơ Pháp Cổ Điển",
          price: 45000,
          discountPercentage: 18,
          image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
          stock: 25,
          category: "Croissant",
          description: "Chiếc croissant nướng lò thủ công mỗi sáng sớm tại Aura. Lớp vỏ ngàn lớp óng ả giòn tan bên ngoài, ẩn giấu cấu trúc ruột bánh ẩm xốp mềm, dậy hương bơ Isigny nhập khẩu béo ngậy đậm chất Pháp.",
          ingredients: "Bột mì đa dụng Pháp, bơ lạt Isigny Normandy, men sống tự nhiên, mật ong hoa nhãn.",
          views: 1250,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (New)
        },
        {
          id: "tiramisu-royal",
          name: "Bánh Tiramisu Hoàng Gia Ý",
          price: 85000,
          discountPercentage: 11,
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop",
          stock: 12,
          category: "Bánh Ngọt",
          description: "Một tác phẩm nghệ thuật tinh tế từ Ý. Cốt bánh sampa (ladyfingers) được nhúng ngập trong ly espresso đậm đặc thơm lừng kèm rượu hương hạnh nhân amaretto, phủ lớp kem phô mai mascarpone béo ngậy.",
          ingredients: "Phô mai Mascarpone Ý, rượu Amaretto, cà phê Espresso đặc biệt, trứng gà hữu cơ, bột ca cao.",
          views: 1100,
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago (Not new)
        },
        {
          id: "matcha-crepe",
          name: "Bánh Mille Crepe Matcha Nhật Bản",
          price: 89000,
          discountPercentage: 19,
          image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop",
          stock: 10,
          category: "Bánh Ngọt",
          description: "Hơn 20 lớp bánh crepe mỏng như lụa xếp chồng đan xen lớp kem tươi tươi mát vị matcha Uji nhập khẩu trực tiếp từ Nhật Bản. Bánh thanh mát, ít ngọt, ngọt ngào dễ chịu tan ngay trong miệng.",
          ingredients: "Bột matcha Uji cao cấp, kem tươi hữu cơ, trứng gà, bột Crepe hảo hạng.",
          views: 650,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (New)
        },
        {
          id: "red-velvet",
          name: "Bánh Red Velvet Nhung Đỏ Quý Phái",
          price: 90000,
          discountPercentage: 0,
          image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&auto=format&fit=crop",
          stock: 15,
          category: "Bánh Ngọt",
          description: "Màu đỏ nhung rực rỡ tượng trưng cho sự may mắn và hạnh phúc. Chiếc bánh ẩm mịn với vị cacao tinh tế, kết hợp hoàn hảo cùng lớp phủ phô mai kem cream cheese chua béo đậm vị.",
          ingredients: "Phô mai kem Cream Cheese Anchor, bột cacao hữu cơ, vani, bơ sữa tự nhiên.",
          views: 420,
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago (Not new)
        },
        {
          id: "almond-croissant",
          name: "Bánh Croissant Hạnh Nhân Nướng Lò",
          price: 49000,
          discountPercentage: 18,
          image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop",
          stock: 2,
          category: "Croissant",
          description: "Bánh croissant ngàn lớp giòn rụm được bơm đầy kem hạnh nhân frangipane thơm bùi ngọt ngào, phía trên rắc đầy hạnh nhân lát nướng vàng thơm lừng và phủ một lớp đường bột mỏng thanh khiết.",
          ingredients: "Bơ Pháp ngàn lớp, hạt hạnh nhân nghiền nhuyễn, bột hạnh nhân, kem trứng béo sữa.",
          views: 580,
          createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago (Not new)
        },
        {
          id: "combo-royal-tea",
          name: "Combo Trà Hoa Chiều Hoàng Gia Aura",
          price: 189000,
          discountPercentage: 21,
          image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop",
          stock: 4,
          category: "Combo",
          description: "Lựa chọn tinh tế cho buổi hẹn hò lãng mạn. Combo bao gồm 4 chiếc bánh macarons đa sắc hương vị thanh tao nhập từ Pháp cùng 1 bình trà hoa cúc mật ong hảo hạng làm ấm cơ thể.",
          ingredients: "4 bánh Macarons Pháp, bình trà hoa cúc hữu cơ, mật ong rừng tự nhiên.",
          views: 310,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (New)
        }
      ];

      // Bulk create products
      await Product.bulkCreate(initialProducts);
      console.log(">>> Products database has been seeded with initial bakery products.");

      // Seed Reviews
      const mockReviews = [
        // strawberry-shortcake: rating 4.9 (10 reviews)
        ...[5, 5, 5, 5, 5, 5, 5, 5, 5, 4].map((rating, idx) => ({
          productId: "strawberry-shortcake",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: rating === 5 ? "Bánh ngon xuất sắc, dâu tươi ngọt lịm!" : "Bánh ngon, giao hàng hơi trễ một chút.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // chocolate-truffle: rating 5.0 (5 reviews)
        ...[5, 5, 5, 5, 5].map((rating, idx) => ({
          productId: "chocolate-truffle",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: "Hương vị sô-cô-la Bỉ nguyên chất cực kỳ đậm đà, rất béo ngậy!",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // classic-croissant: rating 4.8 (5 reviews)
        ...[5, 5, 5, 5, 4].map((rating, idx) => ({
          productId: "classic-croissant",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: rating === 5 ? "Bánh giòn rụm thơm phức mùi bơ Pháp." : "Bánh ngon nhưng hơi nhỏ một chút.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // tiramisu-royal: rating 4.9 (10 reviews)
        ...[5, 5, 5, 5, 5, 5, 5, 5, 5, 4].map((rating, idx) => ({
          productId: "tiramisu-royal",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: "Lớp kem mascarpone béo ngậy quyện với hương cafe đặc trưng.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // matcha-crepe: rating 4.7 (10 reviews)
        ...[5, 5, 5, 5, 5, 5, 5, 4, 4, 4].map((rating, idx) => ({
          productId: "matcha-crepe",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: rating === 5 ? "Vị matcha Uji chuẩn Nhật Bản, bánh không bị ngọt gắt." : "Bánh ăn ngon, thanh mát.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // red-velvet: rating 4.8 (5 reviews)
        ...[5, 5, 5, 5, 4].map((rating, idx) => ({
          productId: "red-velvet",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: "Bánh cốt mềm ẩm mịn, kem cheese béo ngậy tuyệt vời.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // almond-croissant: rating 4.7 (10 reviews)
        ...[5, 5, 5, 5, 5, 5, 5, 4, 4, 4].map((rating, idx) => ({
          productId: "almond-croissant",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: "Rất nhiều hạnh nhân nướng thơm giòn bùi béo.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        // combo-royal-tea: rating 4.9 (10 reviews)
        ...[5, 5, 5, 5, 5, 5, 5, 5, 5, 4].map((rating, idx) => ({
          productId: "combo-royal-tea",
          reviewerName: `Khách hàng ${idx + 1}`,
          rating,
          comment: "Rất thích hợp cho các buổi chiều chill bên ấm trà nóng và macarons.",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      ];
      await Review.bulkCreate(mockReviews);
      console.log(">>> Mock reviews have been successfully seeded.");

      // Seed OrderItems
      const mockOrderItems = [
        { productId: "strawberry-shortcake", quantity: 148, createdAt: new Date(), updatedAt: new Date() },
        { productId: "chocolate-truffle", quantity: 236, createdAt: new Date(), updatedAt: new Date() },
        { productId: "classic-croissant", quantity: 390, createdAt: new Date(), updatedAt: new Date() },
        { productId: "tiramisu-royal", quantity: 310, createdAt: new Date(), updatedAt: new Date() },
        { productId: "matcha-crepe", quantity: 95, createdAt: new Date(), updatedAt: new Date() },
        { productId: "red-velvet", quantity: 84, createdAt: new Date(), updatedAt: new Date() },
        { productId: "almond-croissant", quantity: 160, createdAt: new Date(), updatedAt: new Date() },
        { productId: "combo-royal-tea", quantity: 78, createdAt: new Date(), updatedAt: new Date() },
      ];
      await OrderItem.bulkCreate(mockOrderItems);
      console.log(">>> Mock order items have been successfully seeded.");

      // Seed Product Images
      const mockProductImages = [
        { productId: "strawberry-shortcake", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop" },
        { productId: "strawberry-shortcake", imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop" },
        { productId: "chocolate-truffle", imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop" },
        { productId: "chocolate-truffle", imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop" },
        { productId: "classic-croissant", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop" },
        { productId: "classic-croissant", imageUrl: "https://images.unsplash.com/photo-1489659639091-8b687bc4386e?w=600&auto=format&fit=crop" },
        { productId: "tiramisu-royal", imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop" },
        { productId: "matcha-crepe", imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop" },
        { productId: "red-velvet", imageUrl: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&auto=format&fit=crop" },
        { productId: "almond-croissant", imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop" },
        { productId: "combo-royal-tea", imageUrl: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop" },
      ];
      await ProductImage.bulkCreate(mockProductImages);
      console.log(">>> Mock product images have been successfully seeded.");
    }
    
    // Proactively update views for existing products if all of them are 0
    const totalViews = await Product.sum("views");
    if (!totalViews || totalViews === 0) {
      const viewUpdates = {
        "strawberry-shortcake": 940,
        "chocolate-truffle": 780,
        "classic-croissant": 1250,
        "tiramisu-royal": 1100,
        "matcha-crepe": 650,
        "red-velvet": 420,
        "almond-croissant": 580,
        "combo-royal-tea": 310,
      };
      for (const [prodId, viewsVal] of Object.entries(viewUpdates)) {
        await Product.update({ views: viewsVal }, { where: { id: prodId } });
      }
      console.log(">>> Updated views for existing products with realistic analytics data.");
    }
  } catch (error) {
    console.error(">>> Error seeding products/reviews/order_items to DB: ", error);
  }
};

const connection = async () => {
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "123456";
  const database = process.env.DB_NAME || "expressjs_db";

  try {
    // Connect to MySQL server first (without database selection) to auto-create database if it doesn't exist
    const mysqlConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
    await mysqlConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await mysqlConnection.end();

    // Authenticate with Sequelize
    await sequelize.authenticate();
    console.log(">>> Connection to MySQL has been established successfully.");

    // Run custom programmatic migrations
    await runMigrations();

    // Seed initial products, reviews, and order items
    await seedProducts();
  } catch (error) {
    console.error(">>> Unable to connect to the database:", error);
    throw error;
  }
};

db.connection = connection;
