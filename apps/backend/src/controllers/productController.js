
import Product from "../models/productModel.js";
import { uploadFile } from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
    try {
        const { brandName, modelName, description, price } = req.body;

        // Validate product details
        if (
            typeof brandName !== "string" || !brandName.trim() ||
            typeof modelName !== "string" || !modelName.trim() ||
            typeof description !== "string" || !description.trim() ||
            price === undefined || price === ""
        ) {
            return res.status(400).json({
                message: "All product fields are required"
            });
        }

        const productPrice = Number(price);

        if (!Number.isFinite(productPrice) || productPrice < 0) {
            return res.status(400).json({
                message: "Price must be a valid non-negative number"
            });
        }

        // Images are optional
        const files = req.files || [];
        const imageUrls = [];

        // Upload images to Cloudinary
        for (const file of files) {
            const result = await uploadFile(file);
            imageUrls.push(result.secure_url);
        }

        // Save product and image URLs in MongoDB
        const product = await Product.create({
            brandName: brandName.trim(),
            modelName: modelName.trim(),
            description: description.trim(),
            price: productPrice,
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






// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

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