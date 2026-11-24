import express from "express";

import {
    getCart,
    addItem,
    updateItem,
    deleteItem
} from "../controllers/cart.controller.js";

const cartRoute = express.Router();

cartRoute.get("/", getCart);

cartRoute.post("/items", addItem);

cartRoute.patch("/items/:productId", updateItem);

cartRoute.delete("/items/:productId", deleteItem);

export default cartRoute;