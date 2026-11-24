import CarritoService from "../services/carrito.service.js";

const carritoService = new CarritoService();

function getUser(req) {
    const user = req.get("x-user");

    if (!user || !user.trim()) {
        const error = new Error(
            "El header x-user es obligatorio"
        );

        error.status = 400;
        throw error;
    }

    return user.trim();
}

function handleError(res, error) {
    const status = error.status || 500;

    if (status === 500) {
        console.error(error);
    }

    res.status(status).json({
        status,
        msg: status === 500
            ? "Error interno del servidor"
            : error.message
    });
}

// Consultar carrito
export const getCart = async (req, res) => {
    try {
        const user = getUser(req);

        const cart = await carritoService.getCart(user);

        res.status(200).json({
            status: 200,
            msg: "Operacion exitosa",
            data: cart
        });

    } catch (error) {
        handleError(res, error);
    }
};

// Agregar producto
export const addItem = async (req, res) => {
    try {
        const user = getUser(req);

        const { productId, quantity } = req.body || {};

        await carritoService.addItem(
            user,
            productId,
            quantity
        );

        res.status(201).json({
            status: 201,
            msg: "Producto agregado correctamente"
        });

    } catch (error) {
        handleError(res, error);
    }
};

// Actualizar cantidad
export const updateItem = async (req, res) => {
    try {
        const user = getUser(req);

        const { productId } = req.params;
        const { quantity } = req.body || {};

        await carritoService.updateItem(
            user,
            productId,
            quantity
        );

        res.status(200).json({
            status: 200,
            msg: "Cantidad actualizada correctamente"
        });

    } catch (error) {
        handleError(res, error);
    }
};

// Eliminar producto
export const deleteItem = async (req, res) => {
    try {
        const user = getUser(req);

        const { productId } = req.params;

        await carritoService.deleteItem(user, productId);

        res.status(204).send();

    } catch (error) {
        handleError(res, error);
    }
};