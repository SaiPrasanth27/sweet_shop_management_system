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
      enum: ["Chocolate", "Gummy", "Hard Candy", "Cookies", "Cakes", "Other"]
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    imageUrl: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty URLs
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'Please provide a valid image URL starting with http:// or https://'
      }
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

// Remove virtual field since we're now storing imageUrl directly

// Instance method
sweetSchema.methods.getFormattedPrice = function () {
  return `₹${this.price}`;
};



module.exports = mongoose.model("Sweet", sweetSchema);
