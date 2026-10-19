import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

export const uploadFile = async (file) => {
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
            folder: "mobile-products",
            resource_type: "image"
        }
    );

    return result;
};

export default cloudinary;