import express from "express";

import {
    createProduct,
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


// Get product by ID
router.get(
    "/:id",
    getProductById
);


// Get products by brand
router.get(
    "/brand/:brandName",
    getProductsByBrand
);


export default router;