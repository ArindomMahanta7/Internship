import express from "express";

import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getProductsByBrand
} from "../controllers/productController.js";

import authenticate from "../middleware/authenticate.js";
import adminOnly from "../middleware/admin.js";
import upload from "../middleware/upload.js";

const router = express.Router();


// Create product - Admin only
router.post(
    "/create",
    authenticate,
    adminOnly,
    upload.array("images", 5),
    createProduct
);


// Get all products
router.get(
    "/",
    getAllProducts
);


// Get products by brand.
// Registered before "/:id" so the literal path isn't swallowed as an id.
router.get(
    "/brand/:brandName",
    getProductsByBrand
);


// Update / delete a product - Admin only
router.put(
    "/:id",
    authenticate,
    adminOnly,
    upload.array("images", 5),
    updateProduct
);

router.delete(
    "/:id",
    authenticate,
    adminOnly,
    deleteProduct
);


// Get product by ID
router.get(
    "/:id",
    getProductById
);


export default router;