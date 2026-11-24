import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productRoute from "./src/routes/product.route.js";
import cartRoute from "./src/routes/cart.route.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);

// Compatibilidad con la Practica 3
app.use("/products", productRoute);

// Archivos del frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.redirect("/home.html");
});

app.get("/shopping_cart.html", (req, res) => {
    res.redirect("/shopping-cart.html");
});

// Rutas API inexistentes
app.use("/api", (req, res) => {
    res.status(404).json({
        msg: "Ruta no encontrada"
    });
});

// Manejo general de errores
app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.status || 500).json({
        msg: error.status === 400
            ? "Solicitud incorrecta"
            : "Error interno del servidor"
    });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Servidor disponible en http://localhost:${port}`);
});