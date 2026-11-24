import { getCart } from "./api.js";
import { saveCart } from "./storage.js";

// Formatear precios
export function formatMoney(value) {

    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value) + " MXN";
}

// Crear elementos del DOM
export function createElement(
    tag,
    className = "",
    text = ""
) {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== "") {
        element.textContent = text;
    }

    return element;
}

// Mostrar mensajes
export function showMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById("message");

    if (!messageBox) {
        return;
    }

    messageBox.className = `alert alert-${type}`;

    messageBox.textContent = message;

    messageBox.hidden = false;
}

// Ocultar mensajes
export function clearMessage() {

    const messageBox =
        document.getElementById("message");

    if (messageBox) {

        messageBox.hidden = true;

        messageBox.textContent = "";
    }
}

// Actualizar indicador del carrito
export function updateCartCount(cart) {

    const badge =
        document.getElementById("cartCount");

    if (badge) {

        badge.textContent = cart?.totalItems ?? 0;
    }
}

// Sincronizar carrito con el servidor
export async function syncCart() {

    const cart = await getCart();

    saveCart(cart);

    updateCartCount(cart);

    return cart;
}

// Validar cantidades
export function validQuantity(
    value,
    allowZero = false
) {

    if (String(value).trim() === "") {
        return false;
    }

    const quantity = Number(value);

    return (
        Number.isInteger(quantity) &&
        quantity >= (allowZero ? 0 : 1)
    );
}

// Crear imagen de producto
export function createProductImage(
    url,
    title,
    className
) {

    const image = createElement("img", className);

    image.alt = title;

    image.addEventListener("error", () => {

        image.src = "/images/placeholder.svg";

    }, { once: true });

    image.src = url || "/images/placeholder.svg";

    return image;
}