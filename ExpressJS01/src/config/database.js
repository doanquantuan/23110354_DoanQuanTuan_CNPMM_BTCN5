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
    if (count < 20) {
      console.log(`>>> Current product count is ${count}, which is less than 20. Re-seeding database with 26 products to properly test lazy loading...`);
      
      // Delete all products. Cascading foreign keys (ON DELETE CASCADE) will automatically clean up child reviews, order_items, and product_images.
      await Product.destroy({ where: {}, force: true });

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
          description: "Hương vị đam mê đậm đà dành cho tín độ sô-cô-la thực thụ. Lớp nhân sô-cô-la truffle Bỉ nguyên chất 70% đắng nhẹ, béo ngậy xen kẽ giữa các lớp bánh xốp mềm ẩm mịn nướng lò hoàn hảo.",
          ingredients: "Sô-cô-la Bỉ nguyên chất 70%, kem bơ cacao Pháp, cốt bánh cacao mềm, bụi sô-cô-la trang trí.",
          views: 780,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        },
        {
          id: "matcha-mousse",
          name: "Bánh Kem Mousse Trà Xanh Uji",
          price: 340000,
          discountPercentage: 10,
          image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop",
          stock: 12,
          category: "Bánh Kem",
          description: "Bánh mousse matcha mềm mịn kết hợp từ bột matcha chuẩn Uji cùng lớp kem tươi béo nhẹ thanh tao.",
          ingredients: "Bột matcha Uji Nhật Bản, kem tươi hữu cơ, cốt bánh chiffon mềm.",
          views: 620,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: "salted-caramel-cake",
          name: "Bánh Kem Phô Mai Caramen Muối",
          price: 380000,
          discountPercentage: 0,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop",
          stock: 6,
          category: "Bánh Kem",
          description: "Sự kết hợp tuyệt vời giữa vị ngọt đậm đà của caramen muối thủ công và cốt bánh phô mai kem béo ngậy.",
          ingredients: "Kem phô mai cream cheese, sốt caramen muối tự chế, đường nâu, kem tươi.",
          views: 710,
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        },
        {
          id: "durian-crepe-cake",
          name: "Bánh Kem Sầu Riêng Ngàn Lớp",
          price: 420000,
          discountPercentage: 15,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop",
          stock: 4,
          category: "Bánh Kem",
          description: "Bánh crepe ngàn lớp xen kẽ sốt sầu Riêng Ri6 tươi nguyên chất béo ngậy nức lòng người hâm mộ.",
          ingredients: "Sầu riêng tươi Ri6, kem tươi ít béo, vỏ bánh crepe mỏng xếp lớp.",
          views: 1050,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
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
          id: "almond-croissant",
          name: "Bánh Croissant Hạnh Nhân Nướng Lò",
          price: 49000,
          discountPercentage: 18,
          image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop",
          stock: 15,
          category: "Croissant",
          description: "Bánh croissant ngàn lớp giòn rụm được bơm đầy kem hạnh nhân frangipane thơm bùi ngọt ngào, phía trên rắc đầy hạnh nhân lát nướng vàng thơm lừng và phủ một lớp đường bột mỏng thanh khiết.",
          ingredients: "Bơ Pháp ngàn lớp, hạt hạnh nhân nghiền nhuyễn, bột hạnh nhân, kem trứng béo sữa.",
          views: 580,
          createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
        },
        {
          id: "chocolate-croissant",
          name: "Bánh Pain au Chocolat Sô-cô-la Bỉ",
          price: 48000,
          discountPercentage: 10,
          image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
          stock: 20,
          category: "Croissant",
          description: "Bánh ngàn lớp kiểu Pháp truyền thống cuộn nhân sô-cô-la chip Bỉ đắng nhẹ, vỏ ngoài giòn tan dậy hương bơ.",
          ingredients: "Bột mì đa dụng Pháp, bơ Isigny, sô-cô-la đen Bỉ 70%.",
          views: 890,
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
        {
          id: "matcha-croissant",
          name: "Bánh Croissant Matcha Kem Sữa",
          price: 52000,
          discountPercentage: 0,
          image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop",
          stock: 18,
          category: "Croissant",
          description: "Chiếc croissant ngàn lớp giòn rụm với nhân kem custard matcha thơm bùi ngọt dịu.",
          ingredients: "Bột mì Pháp, bơ lạt, kem sữa custard matcha Uji Nhật Bản.",
          views: 420,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          id: "salted-egg-croissant",
          name: "Bánh Croissant Kim Sa Trứng Muối",
          price: 55000,
          discountPercentage: 12,
          image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
          stock: 30,
          category: "Croissant",
          description: "Croissant giòn tan cuộn nhân kim sa trứng muối tan chảy béo ngậy, mặn ngọt hài hòa cuốn hút.",
          ingredients: "Bơ Pháp, lòng đỏ trứng muối, sữa đặc, kem béo hữu cơ.",
          views: 1120,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (New)
        },
        {
          id: "strawberry-croissant",
          name: "Bánh Croissant Dâu Tây Kem Tươi",
          price: 59000,
          discountPercentage: 15,
          image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
          stock: 10,
          category: "Croissant",
          description: "Croissant kẹp kem sữa tươi hữu cơ thơm mát kết hợp dâu tây Đà Lạt cắt lát mọng nước.",
          ingredients: "Bơ Pháp ngàn lớp, kem sữa tươi hữu cơ ít béo, dâu tây tươi Đà Lạt.",
          views: 510,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
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
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        },
        {
          id: "macaron-paris",
          name: "Bánh Macaron Paris Tinh Tế (Hộp 6 chiếc)",
          price: 120000,
          discountPercentage: 10,
          image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop",
          stock: 25,
          category: "Bánh Ngọt",
          description: "Hộp bánh macaron đầy màu sắc Pháp, giòn rụm bên ngoài, dai mềm ngọt dịu hương dâu, sô-cô-la, vani, matcha.",
          ingredients: "Bột hạnh nhân Pháp, đường bột, lòng trắng trứng, kem nhân đa hương vị.",
          views: 680,
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        },
        {
          id: "egg-tart-classic",
          name: "Bánh Tart Trứng Bồ Đào Nha",
          price: 25000,
          discountPercentage: 0,
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop",
          stock: 50,
          category: "Bánh Ngọt",
          description: "Bánh tart trứng huyền thoại với lớp vỏ ngàn lớp giòn rụm bao bọc lớp nhân custard trứng sữa nướng cháy xém béo ngậy.",
          ingredients: "Vỏ tart trứng bơ sữa, lòng đỏ trứng gà, kem whipping, sữa tươi.",
          views: 980,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (New)
        },
        {
          id: "blueberry-cheesecake",
          name: "Bánh Cheesecake Việt Quất New York",
          price: 85000,
          discountPercentage: 15,
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop",
          stock: 14,
          category: "Bánh Ngọt",
          description: "Bánh phô mai nướng kiểu New York truyền thống béo ngậy kết hợp sốt việt quất chua ngọt thơm lừng.",
          ingredients: "Phô mai Anchor, bánh quy nghiền làm đế, sốt việt quất hữu cơ Đà Lạt.",
          views: 760,
          createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        },
        {
          id: "garlic-bread",
          name: "Bánh Mì Tỏi Phô Mai Hàn Quốc",
          price: 65000,
          discountPercentage: 15,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
          stock: 40,
          category: "Bánh Mì",
          description: "Bánh mì vỏ giòn dai nhúng ngập sốt bơ tỏi thơm lừng, kẹp lớp phô mai kem béo ngọt chuẩn vị Hàn Quốc.",
          ingredients: "Bột mì hảo hạng, bơ lạt, tỏi cô đơn Lý Sơn, kem phô mai.",
          views: 1310,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (New)
        },
        {
          id: "baguette-french",
          name: "Bánh Mì Baguette Pháp Cổ Điển",
          price: 20000,
          discountPercentage: 0,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
          stock: 100,
          category: "Bánh Mì",
          description: "Bánh mì Baguette vỏ giòn rụm màu vàng óng, ruột bánh mềm dai đặc trưng, nướng mới mỗi sáng.",
          ingredients: "Bột mì Pháp, men tự nhiên, nước, muối.",
          views: 800,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        },
        {
          id: "sour-dough",
          name: "Bánh Mì Men Tự Nhiên Sourdough",
          price: 75000,
          discountPercentage: 10,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
          stock: 15,
          category: "Bánh Mì",
          description: "Ổ bánh sourdough lên men tự nhiên trong 24 giờ, vỏ bánh dày giòn, ruột bánh dai có vị chua nhẹ độc đáo tốt cho sức khỏe.",
          ingredients: "Bột mì lứt hữu cơ, men sourdough nuôi cấy tự nhiên, nước tinh khiết, muối hồng.",
          views: 550,
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        },
        {
          id: "pork-floss-bread",
          name: "Bánh Mì Chà Bông Sốt Phô Mai",
          price: 35000,
          discountPercentage: 0,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
          stock: 35,
          category: "Bánh Mì",
          description: "Bánh mì ngọt siêu mềm nhân sốt phô mai ngậy, phủ ngập chà bông gà cay mặn mặn ngọt ngọt cực kỳ bắt miệng.",
          ingredients: "Bột bánh mì ngọt, chà bông gà cay, sốt phô mai trứng muối đặc biệt.",
          views: 920,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (New)
        },
        {
          id: "rye-bread",
          name: "Bánh Mì Đen Lúa Mạch Hạt Dinh Dưỡng",
          price: 80000,
          discountPercentage: 8,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
          stock: 12,
          category: "Bánh Mì",
          description: "Bánh mì lúa mạch đen giàu chất xơ, trộn lẫn các loại hạt dinh dưỡng như hạt bí, hạt hướng dương, hạnh nhân.",
          ingredients: "Bột lúa mạch đen nhập khẩu, hạt hướng dương, hạt bí ngô, hạnh nhân lát, mật ong rừng.",
          views: 460,
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        },
        {
          id: "sausage-roll",
          name: "Bánh Mì Cuộn Xúc Xích Phô Mai",
          price: 32000,
          discountPercentage: 10,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
          stock: 28,
          category: "Bánh Mì",
          description: "Chiếc bánh mì ăn sáng tuyệt vời với xúc xích cao cấp xông khói kẹp phô mai mozzarella kéo sợi giòn ngậy.",
          ingredients: "Bột ngọt mềm, xúc xích heo xông khói, phô mai mozzarella, sốt cà chua.",
          views: 790,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          id: "combo-royal-tea",
          name: "Combo Trà Hoa Chiều Hoàng Gia Aura",
          price: 189000,
          discountPercentage: 21,
          image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop",
          stock: 10,
          category: "Combo",
          description: "Lựa chọn tinh tế cho buổi hẹn hò lãng mạn. Combo bao gồm 4 chiếc bánh macarons đa sắc hương vị thanh tao nhập từ Pháp cùng 1 bình trà hoa cúc mật ong hảo hạng làm ấm cơ thể.",
          ingredients: "4 bánh Macarons Pháp, bình trà hoa cúc hữu cơ, mật ong rừng tự nhiên.",
          views: 310,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (New)
        },
        {
          id: "combo-breakfast",
          name: "Combo Bữa Sáng Năng Lượng",
          price: 79000,
          discountPercentage: 20,
          image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop",
          stock: 22,
          category: "Combo",
          description: "Khởi đầu ngày mới tràn đầy năng lượng với 1 bánh Croissant bơ tỏi thơm phức cùng 1 ly cà phê Latte nóng ấm.",
          ingredients: "1 Bánh Croissant bơ tỏi, 1 Ly Espresso Latte nóng.",
          views: 880,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (New)
        },
        {
          id: "combo-party-pastries",
          name: "Combo Tiệc Bánh Ngọt Đa Sắc (Hộp 12 Bánh)",
          price: 249000,
          discountPercentage: 15,
          image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop",
          stock: 8,
          category: "Combo",
          description: "Set tiệc mini lý tưởng gồm 12 chiếc bánh ngọt các loại (tart trứng, su kem, crepe, tiramisu mini) đa dạng hương vị.",
          ingredients: "3 Tart trứng, 3 Bánh su kem Pháp, 3 Crepe matcha mini, 3 Tiramisu mini.",
          views: 560,
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        }
      ];

      // Bulk create products
      await Product.bulkCreate(initialProducts);
      console.log(`>>> Products database has been seeded with ${initialProducts.length} premium bakery products.`);

      // Seed Reviews programmatically
      const mockReviews = [];
      const reviewComments = {
        "Bánh Kem": [
          "Bánh kem ngọt dịu, lớp kem tươi hữu cơ béo ngậy ăn không hề ngấy chút nào!",
          "Bánh trang trí rất sang trọng và đẹp mắt, dâu tây ngọt mát lịm.",
          "Cốt bánh bông lan xốp mềm ẩm mịn, hương vani tự nhiên rất thơm.",
          "Giao hàng nhanh, bánh vẫn giữ nguyên hình dáng đẹp đẽ, vote 5 sao!",
          "Hương vị tuyệt hảo, mọi người trong bữa tiệc sinh nhật đều khen ngon."
        ],
        "Croissant": [
          "Lớp vỏ bánh ngàn lớp giòn rụm bên ngoài, ruột bánh ẩm mềm thơm lừng mùi bơ Pháp.",
          "Hương vị bơ béo ngậy cực kỳ chuẩn vị Pháp, ăn kèm cafe sáng rất hợp.",
          "Rất nhiều hạnh nhân/sô-cô-la ngập tràn trong từng miếng cắn, siêu ngon!",
          "Bánh mới ra lò nóng hổi, giòn tan nhai cực đã tai.",
          "Chiếc croissant ngon nhất từng ăn, vỏ óng ả bắt mắt vô cùng."
        ],
        "Bánh Ngọt": [
          "Bột bánh cao cấp tan ngay trong miệng, vị ngọt dịu thanh mát dễ chịu.",
          "Phô mai/mascarpone siêu béo ngậy quyện với hương cà phê/trà xanh rất tinh tế.",
          "Hương vị đậm đà thơm ngon béo ngậy cực kỳ chất lượng.",
          "Trang trí tỉ mỉ tinh xảo trông rất cao cấp và sang xịn mịn.",
          "Bánh ăn rất ngon, không bị ngọt gắt, hợp gu cả nhà."
        ],
        "Bánh Mì": [
          "Bơ tỏi thơm nức mũi từ khi mở hộp, phô mai ngập tràn béo ngậy ngon đỉnh chóp.",
          "Vỏ bánh mì giòn dai đặc trưng nướng lò hoàn hảo, ruột mềm ẩm rất ngon.",
          "Bánh rất nhiều nhân xúc xích/chà bông/hạt dinh dưỡng cực kỳ chất lượng.",
          "Lên men tự nhiên tốt cho sức khỏe, ăn kèm súp hay bơ lạt đều xuất sắc.",
          "Rất thích hợp cho bữa sáng dinh dưỡng nhanh gọn lẹ."
        ],
        "Combo": [
          "Set trà hoa và macarons này chill cực kỳ, bánh giòn ngọt bình trà thơm ngát.",
          "Combo bữa sáng này siêu hời, bánh giòn thơm phối cùng cà phê ấm nóng tuyệt vời.",
          "Set bánh ngọt đa sắc cực kỳ tiện lợi cho tiệc sinh nhật hay liên hoan công ty.",
          "Đóng gói vô cùng đẹp mắt lịch sự, hương vị đa dạng rất đáng tiền.",
          "Sự kết hợp hoàn hảo giữa các món bánh và nước, tiết kiệm hơn mua lẻ nhiều."
        ]
      };

      initialProducts.forEach((product) => {
        // Generate between 6 and 10 reviews per product
        const numReviews = Math.floor(Math.random() * 5) + 6;
        const comments = reviewComments[product.category] || ["Bánh rất ngon và chất lượng, sẽ ủng hộ tiếp!"];
        
        for (let i = 0; i < numReviews; i++) {
          const rating = Math.random() > 0.3 ? 5 : 4; // mostly 5s and some 4s
          const commentIdx = i % comments.length;
          
          mockReviews.push({
            productId: product.id,
            reviewerName: `Khách hàng ${i + 1}`,
            rating,
            comment: comments[commentIdx],
            createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000), // staggered dates
            updatedAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
          });
        }
      });

      await Review.bulkCreate(mockReviews);
      console.log(`>>> Mock reviews (${mockReviews.length} records) have been successfully generated and seeded.`);

      // Seed OrderItems (soldCount >= 100 triggers isBestSeller)
      const mockOrderItems = initialProducts.map((p) => {
        // Assign realistic sold quantities to make a few distinct top sellers
        let quantity = 50 + Math.floor(Math.random() * 50); // baseline 50-100
        if (["classic-croissant", "garlic-bread", "egg-tart-classic", "chocolate-truffle", "strawberry-shortcake", "tiramisu-royal", "combo-breakfast", "salted-egg-croissant"].includes(p.id)) {
          quantity = 200 + Math.floor(Math.random() * 400); // 200-600 for top sellers
        }
        return {
          productId: p.id,
          quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      await OrderItem.bulkCreate(mockOrderItems);
      console.log(">>> Mock order items have been successfully seeded.");

      // Seed Product Images programmatically
      const mockProductImages = [];
      const imagePool = [
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1489659639091-8b687bc4386e?w=600&auto=format&fit=crop"
      ];
      
      initialProducts.forEach((p) => {
        // Every product gets its own main image as the first image
        mockProductImages.push({ productId: p.id, imageUrl: p.image });
        // And 1 more additional random image from the pool to simulate a gallery
        const poolIndex = Math.abs(p.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % imagePool.length;
        mockProductImages.push({ productId: p.id, imageUrl: imagePool[poolIndex] });
      });

      await ProductImage.bulkCreate(mockProductImages);
      console.log(">>> Mock product images have been successfully seeded.");
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
