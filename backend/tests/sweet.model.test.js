// Force test environment
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Sweet = require("../src/models/Sweet");

// Increase timeout for MongoDB + indexes
jest.setTimeout(30000);

let mongoServer;

// Database Setup and Teardown 
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // IMPORTANT: build indexes before tests
  await Sweet.init();
});

afterEach(async () => {
  // Clear data between tests to avoid interference
  await Sweet.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

//Sweet Model Tests

describe("Sweet Model", () => {

  //Sweet Creation 
  describe("Sweet Creation", () => {
    it("should create a valid sweet with required fields", async () => {
      const sweetData = {
        name: "Chocolate Cake",
        description: "Delicious chocolate cake",
        price: 25.99,
        category: "cakes",
        stock: 10,
        imageFilename: "chocolate-cake.jpg"
      };

      const sweet = new Sweet(sweetData);
      const savedSweet = await sweet.save();

      expect(savedSweet._id).toBeDefined();
      expect(savedSweet.name).toBe(sweetData.name);
      expect(savedSweet.description).toBe(sweetData.description);
      expect(savedSweet.price).toBe(sweetData.price);
      expect(savedSweet.category).toBe(sweetData.category);
      expect(savedSweet.stock).toBe(sweetData.stock);
      expect(savedSweet.imageFilename).toBe(sweetData.imageFilename);
      expect(savedSweet.createdAt).toBeDefined();
      expect(savedSweet.updatedAt).toBeDefined();
    });

    it("should set default stock to 0", async () => {
      const sweet = new Sweet({
        name: "Test Sweet",
        description: "Test description",
        price: 10.99,
        category: "candies",
        imageFilename: "test.jpg"
      });

      await sweet.save();
      expect(sweet.stock).toBe(0);
    });
  });

  // Sweet Validation
  describe("Sweet Validation", () => {

    it("should require name", async () => {
      const sweet = new Sweet({
        description: "Test description",
        price: 10.99,
        category: "candies",
        imageFilename: "test.jpg"
      });

      await expect(sweet.save()).rejects.toThrow();
    });

    it("should require description", async () => {
      const sweet = new Sweet({
        name: "Test Sweet",
        price: 10.99,
        category: "candies",
        imageFilename: "test.jpg"
      });

      await expect(sweet.save()).rejects.toThrow();
    });

    it("should require price", async () => {
      const sweet = new Sweet({
        name: "Test Sweet",
        description: "Test description",
        category: "candies",
        imageFilename: "test.jpg"
      });

      await expect(sweet.save()).rejects.toThrow();
    });

    it("should require positive price", async () => {
      const sweet = new Sweet({
        name: "Test Sweet",
        description: "Test description",
        price: -5,
        category: "candies",
        imageFilename: "test.jpg"
      });

      await expect(sweet.save()).rejects.toThrow();
    });

    it("should validate category enum", async () => {
      const sweet = new Sweet({
        name: "Test Sweet",
        description: "Test description",
        price: 10.99,
        category: "invalid",
        imageFilename: "test.jpg"
      });

      await expect(sweet.save()).rejects.toThrow();
    });

    it("should accept valid categories", async () => {
      const categories = ["cakes", "pastries", "candies", "chocolates", "cookies"];

      for (const category of categories) {
        const sweet = new Sweet({
          name: `Test ${category}`,
          description: "Test description",
          price: 10.99,
          category,
          imageFilename: "test.jpg"
        });

        const saved = await sweet.save();
        expect(saved.category).toBe(category);
      }
    });

    it("should require non-negative stock", async () => {
      const sweet = new Sweet({
        name: "Test Sweet",
        description: "Test description",
        price: 10.99,
        category: "candies",
        stock: -1,
        imageFilename: "test.jpg"
      });

      await expect(sweet.save()).rejects.toThrow();
    });
  });

  // Sweet Methods & Virtuals 
  describe("Sweet Methods", () => {
    let sweet;

    beforeEach(async () => {
      sweet = new Sweet({
        name: "Test Sweet",
        description: "Test description",
        price: 25.99,
        category: "cakes",
        stock: 10,
        imageFilename: "test.jpg"
      });

      await sweet.save();
    });

    it("should have getFormattedPrice method", () => {
      expect(typeof sweet.getFormattedPrice).toBe("function");
    });

    it("should format price in rupees", () => {
      expect(sweet.getFormattedPrice()).toBe("₹25.99");
    });

    it("should have virtual imageUrl property", () => {
      expect(sweet.imageUrl).toBe("/api/uploads/test.jpg");
    });

    it("should include imageUrl in JSON output", () => {
      const sweetJSON = sweet.toJSON();
      expect(sweetJSON.imageUrl).toBe("/api/uploads/test.jpg");
    });
  });

  //Sweet Indexes 
  describe("Sweet Indexes", () => {
    it("should have category index for performance", async () => {
      const indexes = await Sweet.collection.getIndexes();
      const hasCategoryIndex = Object.values(indexes).some(index =>
        index.some(field => field[0] === "category")
      );

      expect(hasCategoryIndex).toBe(true);
    });
  });
});
