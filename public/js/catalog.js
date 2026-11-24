import {
    getProducts,
    addToCart
} from "./api.js";

import { readCart } from "./storage.js";

import {
    formatMoney,
    createElement,
    createProductImage,
    showMessage,
    clearMessage,
    updateCartCount,
    syncCart,
    validQuantity
} from "./common.js";

const LIMIT = 4;

let currentPage = 1;
let totalPages = 1;
let searchTitle = "";
let selectedProduct = null;
let loading = false;
let adding = false;
let needsSync = false;

const mainList =
    document.getElementById("mainList");

const catalogStatus =
    document.getElementById("catalogStatus");

const prevPage =
    document.getElementById("prevPage");

const nextPage =
    document.getElementById("nextPage");

const pageInfo =
    document.getElementById("pageInfo");

const quantityInput =
    document.getElementById("quantityInput");

const modalError =
    document.getElementById("modalError");

const confirmAdd =
    document.getElementById("confirmAdd");

// Adaptar los campos del modelo original
function normalizeProduct(product) {

    return {
        id: product._uuid ?? product.uuid,

        title: product._title ?? product.title,

        description:
            product._description ?? product.description,

        imageUrl:
            product._imageUrl ?? product.imageUrl,

        stock:
            product._stock ?? product.stock,

        pricePerUnit:
            product._pricePerUnit ?? product.pricePerUnit,

        unit:
            product._unit ?? product.unit,

        category:
            product._category ?? product.category
    };
}

// Crear tarjeta de producto
function createProductCard(product) {

    const column = createElement(
        "div",
        "col-lg-3 col-md-6 col-sm-6 col-12 mb-4"
    );

    const card = createElement(
        "div",
        "card product-card"
    );

    const image = createProductImage(
        product.imageUrl,
        product.title,
        "card-img-top"
    );

    const body = createElement(
        "div",
        "card-body"
    );

    const title = createElement(
        "h5",
        "card-title",
        product.title
    );

    const description = createElement(
        "p",
        "product-description",
        product.description
    );

    const price = createElement(
        "p",
        "product-price",
        formatMoney(product.pricePerUnit)
    );

    const stock = createElement(
        "p",
        "stock-info",
        `Disponibles: ${product.stock}`
    );

    const button = createElement(
        "button",
        "btn btn-primary btn-block",
        product.stock > 0
            ? "Agregar al carrito"
            : "Sin existencias"
    );

    button.type = "button";

    button.dataset.productId = product.id;

    button.disabled = product.stock <= 0;

    button.addEventListener("click", () => {

        openQuantityModal(product);
    });

    body.append(
        title,
        description,
        price,
        stock,
        button
    );

    card.append(image, body);

    column.append(card);

    return column;
}

// Actualizar controles de paginacion
function updatePagination() {

    pageInfo.textContent =
        totalPages === 0
            ? "Sin resultados"
            : `Pagina ${currentPage} de ${totalPages}`;

    prevPage.disabled =
        loading || currentPage <= 1;

    nextPage.disabled =
        loading ||
        totalPages === 0 ||
        currentPage >= totalPages;
}

// Consultar productos al servidor
async function loadProducts(page = 1) {

    if (loading) {
        return;
    }

    loading = true;

    mainList.replaceChildren();

    catalogStatus.textContent =
        "Cargando productos...";

    updatePagination();

    try {

        const result = await getProducts(
            page,
            LIMIT,
            searchTitle
        );

        currentPage = result.pagination.page;

        totalPages = result.pagination.totalPages;

        const products =
            result.data.map(normalizeProduct);

        if (products.length === 0) {

            catalogStatus.textContent =
                "No se encontraron productos.";

        } else {

            catalogStatus.textContent = "";

            for (const product of products) {

                mainList.append(
                    createProductCard(product)
                );
            }
        }

    } catch (error) {

        catalogStatus.textContent = "";

        const message = createElement(
            "p",
            "text-danger",
            error.message
        );

        const retryButton = createElement(
            "button",
            "btn btn-outline-primary",
            "Reintentar"
        );

        retryButton.addEventListener("click", () => {

            loadProducts(page);
        });

        catalogStatus.append(
            message,
            retryButton
        );

    } finally {

        loading = false;

        updatePagination();
    }
}

// Abrir modal de cantidad
function openQuantityModal(product) {

    if (adding) {
        return;
    }

    selectedProduct = product;

    document.getElementById("modalProductName")
        .textContent = product.title;

    document.getElementById("modalPrice")
        .textContent = formatMoney(product.pricePerUnit);

    document.getElementById("modalStock")
        .textContent = `Stock disponible: ${product.stock}`;

    const modalImage =
        document.getElementById("modalImage");

    modalImage.onerror = () => {

        modalImage.onerror = null;

        modalImage.src = "/images/placeholder.svg";
    };

    modalImage.src = product.imageUrl;

    modalImage.alt = product.title;

    quantityInput.value = 1;

    quantityInput.max = product.stock;

    modalError.textContent = "";

    confirmAdd.disabled = product.stock <= 0;

    confirmAdd.textContent =
        needsSync ? "Sincronizar carrito" : "Agregar";

    window.$("#quantityModal").modal("show");
}

// Impedir cerrar el modal durante una peticion
window.$("#quantityModal")
    .on("hide.bs.modal", event => {

        if (adding) {

            event.preventDefault();
        }
    });

// Agregar producto desde el modal
document.getElementById("quantityForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        if (adding || !selectedProduct) {
            return;
        }

        modalError.textContent = "";

        const quantity = Number(quantityInput.value);

        if (!needsSync) {

            if (!validQuantity(quantityInput.value)) {

                modalError.textContent =
                    "Introduce una cantidad entera mayor que cero.";

                return;
            }

            if (quantity > selectedProduct.stock) {

                modalError.textContent =
                    "La cantidad supera el stock disponible.";

                return;
            }
        }

        adding = true;

        confirmAdd.disabled = true;

        quantityInput.disabled = true;

        confirmAdd.textContent = "Procesando...";

        try {

            // Evitar repetir el POST si ya fue confirmado
            if (!needsSync) {

                await addToCart(
                    selectedProduct.id,
                    quantity
                );

                needsSync = true;
            }

            await syncCart();

            needsSync = false;

            showMessage(
                "Carrito actualizado correctamente."
            );

            adding = false;

            window.$("#quantityModal").modal("hide");

        } catch (error) {

            if (needsSync) {

                modalError.textContent =
                    "El servidor acepto el cambio, pero falta " +
                    "actualizar el carrito. Pulsa Sincronizar carrito.";

            } else {

                modalError.textContent = error.message;

                if (error.status === 404) {

                    modalError.textContent +=
                        " Cierra el modal y actualiza el catalogo.";

                    await loadProducts(currentPage);
                }
            }

        } finally {

            adding = false;

            quantityInput.disabled = false;

            confirmAdd.disabled = false;

            confirmAdd.textContent =
                needsSync
                    ? "Sincronizar carrito"
                    : "Agregar";
        }
    });

// Boton anterior
prevPage.addEventListener("click", () => {

    if (currentPage > 1) {

        loadProducts(currentPage - 1);
    }
});

// Boton siguiente
nextPage.addEventListener("click", () => {

    if (currentPage < totalPages) {

        loadProducts(currentPage + 1);
    }
});

// Buscador
document.getElementById("searchForm")
    .addEventListener("submit", event => {

        event.preventDefault();

        if (loading) {
            return;
        }

        searchTitle = document
            .getElementById("searchInput")
            .value.trim();

        clearMessage();

        loadProducts(1);
    });

// Consultar carrito antes de navegar
document.getElementById("cartLink")
    .addEventListener("click", async event => {

        event.preventDefault();

        if (adding) {
            return;
        }

        const link = event.currentTarget;

        if (link.dataset.busy === "true") {
            return;
        }

        link.dataset.busy = "true";

        try {

            await syncCart();

            needsSync = false;

        } catch (error) {

            console.warn(error.message);

        } finally {

            window.location.href =
                "shopping-cart.html";
        }
    });

// Inicializar catalogo
async function init() {

    const cachedCart = readCart();

    updateCartCount(cachedCart);

    loadProducts(1);

    try {

        await syncCart();

    } catch (error) {

        showMessage(
            "No se pudo actualizar el indicador del carrito. " +
            "Los datos pueden estar desactualizados.",
            "warning"
        );
    }
}

init();