import ProductService from "../services/product.service.js";
import CarritoService from "../services/carrito.service.js";

const productService = new ProductService();
const carritoService = new CarritoService();

// Obtener productos con paginacion
export const getAll = async (req, res) => {

    try {

        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 4);

        const title = req.query.title || "";
        const category = req.query.category || "";

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {

            return res.status(400).json({
                msg: "Parametros de paginacion incorrectos"
            });
        }

        const products = await productService
            .getProductsWithFilter(`${title}:${category}`);

        const totalProducts = products.length;

        const totalPages = Math.ceil(
            totalProducts / limit
        );

        const start = (page - 1) * limit;

        const data = products.slice(
            start,
            start + limit
        );

        res.status(200).json({

            status: 200,

            msg: "Operacion exitosa",

            data,

            pagination: {
                page,
                limit,
                totalProducts,
                totalPages
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            msg: "Error al obtener los productos"
        });
    }
};

// Obtener un producto por su ID
export const getById = async (req, res) => {

    try {

        const [found, product] =
            await productService.getProductById(
                req.params.id
            );

        if (!found) {

            return res.status(404).json({
                msg: "Producto no encontrado"
            });
        }

        res.status(200).json({
            status: 200,
            msg: "Operacion exitosa",
            data: product
        });

    } catch (error) {

        res.status(500).json({
            msg: "Error al consultar el producto"
        });
    }
};

// Ruta original de la Practica 3
export const cartProducts = async (req, res) => {

    try {

        const { ids } = req.body || {};
        const user = req.get("x-user")?.trim();

        if (
            !user ||
            !Array.isArray(ids) ||
            !ids.every(id => typeof id === "string")
        ) {

            return res.status(400).json({
                msg: "Se requiere usuario y un arreglo de IDs"
            });
        }

        const [hasInvalidIds, invalidIds] =
            await productService.validarIds(ids);

        if (hasInvalidIds) {

            return res.status(404).json({
                msg: "Uno o varios IDs no encontrados",
                data: invalidIds
            });
        }

        await carritoService.guardarCarrito(user, ids);

        res.status(200).json({
            msg: "Carrito guardado correctamente"
        });

    } catch (error) {

        res.status(error.status || 500).json({
            msg: error.message || "Error al guardar el carrito"
        });
    }
};