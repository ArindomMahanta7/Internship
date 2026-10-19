
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            required: true,
            trim: true
        },

        modelName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },
        images: {
           type: [String],
           default: []
}
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
