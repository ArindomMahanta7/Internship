import jwt from "jsonwebtoken";

const authenticate = async (req, res, next) => {
    try {
        // Get token from HTTP-only cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required. Please log in."
            });
        }

        // Verify the JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach user information to the request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        // Continue to the next middleware or controller
        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token. Please log in again."
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export default authenticate;