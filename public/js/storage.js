import { USER } from "./api.js";

const STORAGE_KEY = `ecommerce.cart.${USER}`;

// Guardar copia del carrito
export function saveCart(cart) {

    try {

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.warn(
            "No se pudo guardar sessionStorage",
            error
        );
    }
}

// Leer copia del carrito
export function readCart() {

    try {

        const storedCart =
            sessionStorage.getItem(STORAGE_KEY);

        if (!storedCart) {
            return null;
        }

        const cart = JSON.parse(storedCart);

        if (
            !cart ||
            cart.user !== USER ||
            !Array.isArray(cart.items) ||
            !Number.isFinite(cart.total) ||
            !Number.isInteger(cart.totalItems)
        ) {

            clearCart();

            return null;
        }

        return cart;

    } catch (error) {

        clearCart();

        return null;
    }
}

// Eliminar copia temporal
export function clearCart() {

    try {

        sessionStorage.removeItem(STORAGE_KEY);

    } catch (error) {

        console.warn(
            "No se pudo limpiar sessionStorage"
        );
    }
}