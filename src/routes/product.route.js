import express from "express";

import {
    getAll,
    getById,
    cartProducts
} from "../controllers/product.controller.js";

const productRoute = express.Router();

productRoute.get("/", getAll);

productRoute.post("/cart", cartProducts);

productRoute.get("/:id", getById);

export default productRoute;