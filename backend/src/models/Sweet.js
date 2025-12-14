const mongoose = require("mongoose");
// Sweet Schema and Model definition.
const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: ["cakes", "pastries", "candies", "chocolates", "cookies"]
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    imageFilename: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
sweetSchema.index({ category: 1 });
sweetSchema.index({ name: "text", description: "text" });

// Virtual field
sweetSchema.virtual("imageUrl").get(function () {
  return `/api/uploads/${this.imageFilename}`;
});

// Instance method
sweetSchema.methods.getFormattedPrice = function () {
  return `₹${this.price}`;
};

module.exports = mongoose.model("Sweet", sweetSchema);
