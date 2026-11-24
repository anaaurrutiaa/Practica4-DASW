import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import Product from "../models/product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(
    __dirname,
    "../data/products.json"
);

// Normalizar texto para facilitar las busquedas
function normalizeText(text = "") {

    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/cacahuetes?/g, "cacahuate")
        .replace(/cacahuates/g, "cacahuate")
        .replace(/manis?/g, "cacahuate")
        .replace(/bananas?/g, "platano")
        .trim();
}

class ProductService {

    async _loadFile() {

        const content = await fs.readFile(
            filePath,
            "utf8"
        );

        return JSON.parse(content).map(product =>
            Product.createFromObject(product)
        );
    }

    async getProducts() {

        return await this._loadFile();
    }

    async getProductsWithFilter(query = "") {

        const products = await this._loadFile();

        let [title = "", category = ""] = query.split(":");

        title = normalizeText(title);
        category = normalizeText(category);

        return products.filter(product => {

            const productTitle =
                normalizeText(product.title);

            const productDescription =
                normalizeText(product.description);

            const productCategory =
                normalizeText(product.category);

            const searchableText =
                `${productTitle} ${productDescription} ${productCategory}`;

            const matchesTitle =
                !title ||
                title === "undefined" ||
                title.split(/\s+/).every(word =>
                    searchableText.includes(word)
                );

            const matchesCategory =
                !category ||
                category === "undefined" ||
                productCategory.includes(category);

            return matchesTitle && matchesCategory;
        });
    }

    async getProductById(id) {

        const products = await this._loadFile();

        const product = products.find(
            p => p.uuid === id
        );

        return [product !== undefined, product];
    }

    async validarIds(ids = []) {

        const products = await this._loadFile();

        const invalidIds = ids.filter(id =>
            !products.some(product => product.uuid === id)
        );

        return [
            invalidIds.length > 0,
            invalidIds
        ];
    }
}

export default ProductService;