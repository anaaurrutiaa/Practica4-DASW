import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import ProductService from "./product.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(
    __dirname,
    "../data/carrito.json"
);

const productService = new ProductService();

let pending = Promise.resolve();

function createError(status, message) {

    const error = new Error(message);
    error.status = status;

    return error;
}

function roundMoney(value) {
    return Math.round(value * 100) / 100;
}

class CarritoService {

    // Leer los carritos guardados
    async _loadFile() {

        const content = await fs.readFile(
            filePath,
            "utf8"
        );

        return JSON.parse(content);
    }

    // Guardar los carritos
    async _saveFile(data) {

        await fs.writeFile(
            filePath,
            JSON.stringify(data, null, 2),
            "utf8"
        );
    }

    // Evitar operaciones simultaneas sobre el archivo
    _transaction(operation) {

        const result = pending.then(operation);

        pending = result.catch(() => {});

        return result;
    }

    // Convertir el formato antiguo al formato con cantidades
    _normalizeCart(cart = []) {

        const items = [];

        for (const entry of cart) {

            const productId =
                typeof entry === "string"
                    ? entry
                    : entry.productId;

            const quantity =
                typeof entry === "string"
                    ? 1
                    : entry.quantity;

            if (
                !productId ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                continue;
            }

            const existing = items.find(
                item => item.productId === productId
            );

            if (existing) {

                existing.quantity += quantity;

            } else {

                items.push({
                    productId,
                    quantity
                });
            }
        }

        return items;
    }

    // Obtener el carrito de un usuario
    _getUserCart(database, user) {

        let cart = database.find(
            entry => entry.user === user
        );

        if (!cart) {

            cart = {
                user,
                cart: []
            };

            database.push(cart);
        }

        cart.cart = this._normalizeCart(cart.cart);

        return cart;
    }

    // Validar producto, cantidad y stock
    async _validateProduct(productId, quantity) {

        if (typeof productId !== "string" || !productId) {

            throw createError(
                400,
                "ID de producto incorrecto"
            );
        }

        if (!Number.isInteger(quantity) || quantity < 1) {

            throw createError(
                400,
                "La cantidad debe ser un entero mayor que cero"
            );
        }

        const [found, product] =
            await productService.getProductById(productId);

        if (!found) {

            throw createError(
                404,
                "Producto no encontrado"
            );
        }

        if (quantity > product.stock) {

            throw createError(
                409,
                `Stock insuficiente. Disponibles: ${product.stock}`
            );
        }

        return product;
    }

    // Obtener el carrito completo
    async getCart(user) {

        return this._transaction(async () => {

            const database = await this._loadFile();

            const userCart =
                this._getUserCart(database, user);

            const products =
                await productService.getProducts();

            const items = [];

            for (const entry of userCart.cart) {

                const product = products.find(
                    p => p.uuid === entry.productId
                );

                if (!product) {
                    continue;
                }

                items.push({

                    productId: product.uuid,

                    title: product.title,

                    imageUrl: product.imageUrl,

                    pricePerUnit: product.pricePerUnit,

                    stock: product.stock,

                    quantity: entry.quantity,

                    subtotal: roundMoney(
                        product.pricePerUnit * entry.quantity
                    )
                });
            }

            const totalItems = items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );

            const total = roundMoney(
                items.reduce(
                    (sum, item) => sum + item.subtotal,
                    0
                )
            );

            return {
                user,
                items,
                totalItems,
                total
            };
        });
    }

    // Agregar un producto al carrito
    async addItem(user, productId, quantity) {

        return this._transaction(async () => {

            await this._validateProduct(
                productId,
                quantity
            );

            const database = await this._loadFile();

            const userCart =
                this._getUserCart(database, user);

            const existing = userCart.cart.find(
                item => item.productId === productId
            );

            const newQuantity =
                (existing ? existing.quantity : 0) + quantity;

            await this._validateProduct(
                productId,
                newQuantity
            );

            if (existing) {

                existing.quantity = newQuantity;

            } else {

                userCart.cart.push({
                    productId,
                    quantity
                });
            }

            await this._saveFile(database);
        });
    }

    // Actualizar cantidad de un producto
    async updateItem(user, productId, quantity) {

        return this._transaction(async () => {

            await this._validateProduct(
                productId,
                quantity
            );

            const database = await this._loadFile();

            const userCart =
                this._getUserCart(database, user);

            const item = userCart.cart.find(
                entry => entry.productId === productId
            );

            if (!item) {

                throw createError(
                    404,
                    "El producto no esta en el carrito"
                );
            }

            item.quantity = quantity;

            await this._saveFile(database);
        });
    }

    // Eliminar un producto del carrito
    async deleteItem(user, productId) {

        return this._transaction(async () => {

            const database = await this._loadFile();

            const userCart =
                this._getUserCart(database, user);

            const index = userCart.cart.findIndex(
                item => item.productId === productId
            );

            if (index === -1) {

                throw createError(
                    404,
                    "El producto no esta en el carrito"
                );
            }

            userCart.cart.splice(index, 1);

            await this._saveFile(database);
        });
    }

    // Compatibilidad con la Practica 3
    async guardarCarrito(user, ids) {

        return this._transaction(async () => {

            const database = await this._loadFile();

            const userCart =
                this._getUserCart(database, user);

            const items = this._normalizeCart(ids);

            for (const item of items) {

                await this._validateProduct(
                    item.productId,
                    item.quantity
                );
            }

            userCart.cart = items;

            await this._saveFile(database);

            return [
                true,
                "Operacion exitosa"
            ];
        });
    }
}

export default CarritoService;