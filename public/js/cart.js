import {
    updateCartItem,
    deleteCartItem
} from "./api.js";

import { readCart } from "./storage.js";

import {
    createElement,
    createProductImage,
    formatMoney,
    showMessage,
    clearMessage,
    syncCart,
    updateCartCount,
    validQuantity
} from "./common.js";

const cartItems =
    document.getElementById("cartItems");

const cartStatus =
    document.getElementById("cartStatus");

const totalItems =
    document.getElementById("totalItems");

const cartTotal =
    document.getElementById("cartTotal");

let currentCart = null;
let online = false;
let busy = false;

// Mostrar carrito vacio
function renderEmptyCart() {

    const container = createElement(
        "div",
        "empty-state"
    );

    const icon = createElement(
        "i",
        "fas fa-shopping-cart"
    );

    const title = createElement(
        "h4",
        "",
        "Tu carrito esta vacio"
    );

    const description = createElement(
        "p",
        "text-muted",
        "Agrega productos desde nuestro catalogo."
    );

    const link = createElement(
        "a",
        "btn btn-primary",
        "Ver productos"
    );

    link.href = "home.html";

    container.append(
        icon,
        title,
        description,
        link
    );

    cartItems.append(container);
}

// Actualizar totales
function updateTotals(cart) {

    totalItems.textContent = cart.totalItems;

    cartTotal.textContent =
        formatMoney(cart.total);

    updateCartCount(cart);
}

// Crear botones
function createButton(text, className) {

    const button = createElement(
        "button",
        className,
        text
    );

    button.type = "button";

    return button;
}

// Crear una entrada del carrito
function createCartItem(item) {

    const container = createElement(
        "article",
        "cart-item"
    );

    container.dataset.productId =
        item.productId;

    const image = createProductImage(
        item.imageUrl,
        item.title,
        "cart-item-image"
    );

    const details = createElement(
        "div",
        "cart-item-details"
    );

    const title = createElement(
        "h5",
        "",
        item.title
    );

    const productId = createElement(
        "small",
        "text-muted d-block text-break mb-2",
        `ID: ${item.productId}`
    );

    const price = createElement(
        "p",
        "",
        `Precio unitario: ${formatMoney(item.pricePerUnit)}`
    );

    const stock = createElement(
        "p",
        "text-muted",
        `Stock disponible: ${item.stock}`
    );

    const quantityLabel = createElement(
        "label",
        "mr-2",
        "Cantidad:"
    );

    const quantityInput = createElement(
        "input",
        "form-control quantity-field"
    );

    quantityInput.type = "number";

    quantityInput.min = 0;

    quantityInput.max = item.stock;

    quantityInput.step = 1;

    quantityInput.value = item.quantity;

    quantityInput.disabled = true;

    quantityInput.id =
        `quantity-${item.productId}`;

    quantityLabel.htmlFor =
        quantityInput.id;

    const quantityContainer = createElement(
        "div",
        "mb-3"
    );

    quantityContainer.append(
        quantityLabel,
        quantityInput
    );

    const subtotal = createElement(
        "strong",
        "text-success",
        `Subtotal: ${formatMoney(item.subtotal)}`
    );

    const actions = createElement(
        "div",
        "cart-actions"
    );

    const editButton = createButton(
        "Editar",
        "btn btn-outline-primary btn-sm"
    );

    const deleteButton = createButton(
        "Eliminar",
        "btn btn-outline-danger btn-sm"
    );

    const confirmButton = createButton(
        "Confirmar",
        "btn btn-success btn-sm"
    );

    const cancelButton = createButton(
        "Cancelar",
        "btn btn-secondary btn-sm"
    );

    const errorBox = createElement(
        "div",
        "item-error"
    );

    errorBox.setAttribute("role", "alert");

    confirmButton.hidden = true;

    cancelButton.hidden = true;

    editButton.disabled = !online;

    deleteButton.disabled = !online;

    // Habilitar edicion
    editButton.addEventListener("click", () => {

        if (!online || busy) {
            return;
        }

        quantityInput.disabled = false;

        quantityInput.focus();

        editButton.hidden = true;

        deleteButton.hidden = true;

        confirmButton.hidden = false;

        cancelButton.hidden = false;

        errorBox.textContent = "";
    });

    // Cancelar edicion
    cancelButton.addEventListener("click", () => {

        if (busy) {
            return;
        }

        quantityInput.value = item.quantity;

        quantityInput.disabled = true;

        editButton.hidden = false;

        deleteButton.hidden = false;

        confirmButton.hidden = true;

        cancelButton.hidden = true;

        errorBox.textContent = "";
    });

    // Confirmar nueva cantidad
    confirmButton.addEventListener(
        "click",
        async () => {

            if (!online || busy) {
                return;
            }

            errorBox.textContent = "";

            if (!validQuantity(quantityInput.value, true)) {

                errorBox.textContent =
                    "Introduce un numero entero mayor o igual a cero.";

                return;
            }

            const quantity =
                Number(quantityInput.value);

            // Cantidad cero equivale a eliminar
            if (quantity === 0) {

                const confirmed = window.confirm(
                    `Deseas eliminar ${item.title} del carrito?`
                );

                if (!confirmed) {
                    return;
                }

                await performMutation(
                    () => deleteCartItem(item.productId),
                    "Producto eliminado correctamente.",
                    errorBox
                );

                return;
            }

            if (quantity > item.stock) {

                errorBox.textContent =
                    `Stock insuficiente. Disponibles: ${item.stock}`;

                return;
            }

            await performMutation(
                () => updateCartItem(item.productId, quantity),
                "Cantidad actualizada correctamente.",
                errorBox
            );
        }
    );

    // Eliminar producto
    deleteButton.addEventListener(
        "click",
        async () => {

            if (!online || busy) {
                return;
            }

            const confirmed = window.confirm(
                `Deseas eliminar ${item.title} del carrito?`
            );

            if (!confirmed) {
                return;
            }

            await performMutation(
                () => deleteCartItem(item.productId),
                "Producto eliminado correctamente.",
                errorBox
            );
        }
    );

    actions.append(
        editButton,
        deleteButton,
        confirmButton,
        cancelButton
    );

    details.append(
        title,
        productId,
        price,
        stock,
        quantityContainer,
        subtotal,
        actions,
        errorBox
    );

    container.append(image, details);

    return container;
}

// Mostrar carrito completo
function renderCart(cart) {

    cartItems.replaceChildren();

    updateTotals(cart);

    if (cart.items.length === 0) {

        renderEmptyCart();

        return;
    }

    for (const item of cart.items) {

        cartItems.append(
            createCartItem(item)
        );
    }
}

// Bloquear controles mientras se realiza una peticion
function lockControls() {

    const controls = Array.from(
        cartItems.querySelectorAll("button, input")
    );

    const previousStates = controls.map(control => ({

        control,

        disabled: control.disabled
    }));

    for (const control of controls) {

        control.disabled = true;
    }

    return () => {

        for (const entry of previousStates) {

            if (entry.control.isConnected) {

                entry.control.disabled =
                    entry.disabled;
            }
        }
    };
}

// Mostrar error de conexion
function showOfflineStatus(message) {

    cartStatus.replaceChildren();

    const warning = createElement(
        "div",
        "alert alert-warning"
    );

    const text = createElement(
        "p",
        "mb-2",
        message
    );

    const retryButton = createButton(
        "Reintentar",
        "btn btn-outline-dark btn-sm"
    );

    retryButton.addEventListener(
        "click",
        loadCart
    );

    warning.append(text, retryButton);

    cartStatus.append(warning);
}

// Ejecutar una modificacion del carrito
async function performMutation(
    operation,
    message,
    errorBox
) {

    if (busy || !online) {
        return;
    }

    busy = true;

    clearMessage();

    const unlock = lockControls();

    let mutationConfirmed = false;

    try {

        await operation();

        mutationConfirmed = true;

        currentCart = await syncCart();

        online = true;

        renderCart(currentCart);

        showMessage(message);

    } catch (error) {

        const connectionError =
            !error.status || error.status >= 500;

        if (mutationConfirmed || connectionError) {

            online = false;

            if (currentCart) {

                renderCart(currentCart);
            }

            showOfflineStatus(
                "Datos sin actualizar. No se permiten cambios " +
                "hasta recuperar la conexion con el servidor."
            );

            showMessage(

                mutationConfirmed
                    ? "El cambio fue aceptado, pero falta sincronizar."
                    : error.message,

                "warning"
            );

        } else {

            errorBox.textContent = error.message;
        }

    } finally {

        busy = false;

        if (online) {

            unlock();
        }
    }
}

// Cargar carrito
async function loadCart() {

    if (busy) {
        return;
    }

    busy = true;

    online = false;

    clearMessage();

    cartStatus.textContent =
        "Cargando carrito...";

    currentCart = readCart();

    if (currentCart) {

        renderCart(currentCart);

    } else {

        cartItems.replaceChildren();

        totalItems.textContent = "—";

        cartTotal.textContent = "—";
    }

    try {

        currentCart = await syncCart();

        online = true;

        cartStatus.textContent = "";

        renderCart(currentCart);

    } catch (error) {

        online = false;

        if (currentCart) {

            renderCart(currentCart);

            showOfflineStatus(
                "Datos sin actualizar. Se muestra la ultima " +
                "copia guardada. Las modificaciones estan deshabilitadas."
            );

        } else {

            showOfflineStatus(
                "No se pudo consultar el carrito. " +
                "Reintenta cuando el servidor este disponible."
            );
        }

    } finally {

        busy = false;
    }
}

// Detectar perdida de conexion
window.addEventListener("offline", () => {

    online = false;

    if (currentCart) {

        renderCart(currentCart);
    }

    showOfflineStatus(
        "Datos sin actualizar. No hay conexion."
    );
});

// Inicializar pagina
loadCart();