import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Users } from "../models/index.js";

dotenv.config({ override: true });

const JWT_SECRET = process.env.JWT_SECRET || "shopsphere_super_secret_jwt_key_123";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: "user" | "admin" };
      
      const user = await Users.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found associated with this token." });
      }

      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired authentication token." });
    }
  } else {
    return res.status(401).json({ message: "Authorization token is missing or malformed." });
  }
}

export function isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Administrative privilege required." });
  }
}
