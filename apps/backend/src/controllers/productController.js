
import Product from "../models/productModel.js";
import { uploadFile } from "../config/cloudinary.js";

/* Fields an admin may send alongside the images. `images` is handled
 * separately (it arrives as uploaded files, not JSON). */
function pickProductFields(body) {
    const out = {};
    if (typeof body.brandName === "string") out.brandName = body.brandName.trim();
    if (typeof body.modelName === "string") out.modelName = body.modelName.trim();
    if (typeof body.description === "string") out.description = body.description.trim();
    if (typeof body.tagline === "string") out.tagline = body.tagline.trim();
    if (typeof body.badge === "string") out.badge = body.badge.trim() || null;
    if (typeof body.color === "string") out.color = body.color.trim();

    if (body.price !== undefined && body.price !== "") out.price = Number(body.price);
    if (body.oldPrice !== undefined && body.oldPrice !== "") out.oldPrice = Number(body.oldPrice);
    if (body.stock !== undefined && body.stock !== "") out.stock = Number(body.stock);
    else if (body.stock === "") out.stock = 0;

    return out;
}

function validatePrices({ price, oldPrice }) {
    if (!Number.isFinite(price) || price < 0) {
        return "Price must be a valid non-negative number";
    }
    if (oldPrice !== undefined && oldPrice !== null) {
        if (!Number.isFinite(oldPrice) || oldPrice < 0) {
            return "MRP must be a valid non-negative number";
        }
    }
    return null;
}

export const createProduct = async (req, res) => {
    try {
        const fields = pickProductFields(req.body);

        // Validate product details
        if (
            typeof fields.brandName !== "string" || !fields.brandName ||
            typeof fields.modelName !== "string" || !fields.modelName ||
            typeof fields.description !== "string" || !fields.description ||
            fields.price === undefined
        ) {
            return res.status(400).json({
                message: "All product fields are required"
            });
        }

        const priceError = validatePrices(fields);
        if (priceError) {
            return res.status(400).json({ message: priceError });
        }

        // Images are optional
        const files = req.files || [];
        const imageUrls = [];

        // Upload images to Cloudinary (or local disk when not configured)
        for (const file of files) {
            const result = await uploadFile(file);
            imageUrls.push(result.secure_url);
        }

        // Save product and image URLs in MongoDB
        const product = await Product.create({
            ...fields,
            images: imageUrls
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            message: "Failed to create product"
        });
    }
};


// Update a product (admin) - optional replacement images.
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const fields = pickProductFields(req.body);
        const priceError = validatePrices({
            price: fields.price ?? product.price,
            oldPrice: fields.oldPrice !== undefined ? fields.oldPrice : product.oldPrice
        });
        if (priceError) {
            return res.status(400).json({ message: priceError });
        }

        const files = req.files || [];
        const imageUrls = [];
        for (const file of files) {
            const result = await uploadFile(file);
            imageUrls.push(result.secure_url);
        }

        Object.assign(product, fields);
        // Only swap the image list when new files were uploaded.
        if (imageUrls.length > 0) product.images = imageUrls;

        await product.save();

        return res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({ message: "Failed to update product" });
    }
};


// Delete a product (admin).
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
};


// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        console.error("Get all products error:", error);

        return res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};


// Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product fetched successfully",
            product
        });
    } catch (error) {
        console.error("Get product by ID error:", error);

        // A malformed ObjectId is a client error, not a server failure.
        if (error.name === "CastError") {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(500).json({
            message: "Failed to fetch product"
        });
    }
};


// Get products by brand name
export const getProductsByBrand = async (req, res) => {
    try {
        const { brandName } = req.params;

        const products = await Product.find({
            brandName: {
                $regex: `^${brandName}$`,
                $options: "i"
            }
        });

        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found for this brand"
            });
        }

        return res.status(200).json({
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        console.error("Get products by brand error:", error);

        return res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};
