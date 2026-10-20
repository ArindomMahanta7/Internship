import mongoose from "mongoose";
import crypto from "node:crypto";

/* Short human-friendly order code shown to the customer (e.g. BC-4F2K9XA).
 * Generated once per order in a pre-save hook - only for new documents, so
 * existing orders never get re-rolled. */
const generateOrderRef = () =>
    `BC-${crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 7)}`;

const orderSchema = new mongoose.Schema(
    {
        orderRef: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

/* Mint the order code for brand-new orders (isNew covers create()). Kept
 * synchronous - no `next` callback - which is how Mongoose 8 prefers hooks. */
orderSchema.pre("validate", function () {
    if (this.isNew && !this.orderRef) {
        this.orderRef = generateOrderRef();
    }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;