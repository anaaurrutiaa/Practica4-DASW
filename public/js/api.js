export const USER = "ana";

const API_URL = "/api";

// Funcion generica para solicitudes HTTP
async function request(endpoint, options = {}) {

    const headers = {
        "x-user": USER,
        ...options.headers
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    let response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

    } catch (error) {
        throw new Error(
            "No se pudo conectar con el servidor. Reintenta."
        );
    }

    // La respuesta 204 no contiene JSON
    if (response.status === 204) {
        return null;
    }

    let result;

    try {
        result = await response.json();

    } catch (error) {
        throw new Error(
            "El servidor devolvio una respuesta incorrecta"
        );
    }

    if (!response.ok) {

        const error = new Error(
            result.msg ||
            result.message ||
            `Error HTTP ${response.status}`
        );

        error.status = response.status;

        throw error;
    }

    return result;
}

// Consultar catalogo
export async function getProducts(
    page = 1,
    limit = 4,
    title = ""
) {

    const params = new URLSearchParams({
        page,
        limit
    });

    if (title) {
        params.set("title", title);
    }

    return await request(`/products?${params}`);
}

// Consultar un producto
export async function getProduct(productId) {

    const result = await request(
        `/products/${encodeURIComponent(productId)}`
    );

    return result.data;
}

// Consultar carrito
export async function getCart() {

    const result = await request("/cart");

    return result.data;
}

// Agregar producto
export async function addToCart(productId, quantity) {

    return await request("/cart/items", {

        method: "POST",

        body: JSON.stringify({
            productId,
            quantity
        })
    });
}

// Actualizar cantidad
export async function updateCartItem(productId, quantity) {

    return await request(
        `/cart/items/${encodeURIComponent(productId)}`,
        {
            method: "PATCH",

            body: JSON.stringify({
                quantity
            })
        }
    );
}

// Eliminar producto
export async function deleteCartItem(productId) {

    return await request(
        `/cart/items/${encodeURIComponent(productId)}`,
        {
            method: "DELETE"
        }
    );
}