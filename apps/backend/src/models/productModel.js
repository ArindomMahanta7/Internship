
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

        /* Short marketing line shown under the product name on cards. */
        tagline: {
            type: String,
            default: "",
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        /* Struck-through MRP. Null/absent means "no discount shown". */
        oldPrice: {
            type: Number,
            default: null,
            min: 0
        },

        /* e-commerce badge, e.g. "Flagship", "Best value". */
        badge: {
            type: String,
            default: null,
            trim: true
        },

        /* Hex tint used for the fallback phone art when a product has no
         * photo, and as the glow colour behind the image. */
        color: {
            type: String,
            default: "#3b82f6",
            trim: true
        },

        stock: {
            type: Number,
            default: 0,
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
