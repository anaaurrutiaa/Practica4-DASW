# Practica 4 - Integracion Frontend y Backend

## Desarrollo de Aplicaciones y Servicios Web

## Descripcion

Esta practica consiste en la integracion del frontend
desarrollado en la Practica 1 con el backend de la
Practica 3.

La aplicacion permite consultar productos, agregarlos
al carrito, modificar cantidades, eliminar productos
y consultar el total de la compra.

## Tecnologias utilizadas

- HTML5
- CSS3
- Bootstrap 4
- JavaScript
- Fetch API
- Node.js
- Express
- JSON
- sessionStorage

## Instalacion

Es necesario tener Node.js y npm instalados.

Desde la carpeta principal del proyecto ejecutar:

    npm install

## Ejecucion

Para iniciar el servidor:

    npm start

Para iniciar en modo desarrollo:

    npm run dev

## Acceso a la aplicacion

Catalogo:

http://localhost:8080/home.html

Carrito:

http://localhost:8080/shopping-cart.html

Puerto: 8080

Usuario de prueba: ana

## Funcionalidades

- Catalogo de productos desde el servidor.
- Paginacion de cuatro productos por pagina.
- Busqueda de productos por titulo.
- Modal para seleccionar cantidades.
- Validacion de cantidades y stock.
- Agregar productos al carrito.
- Acumular cantidades de un mismo producto.
- Editar cantidades.
- Eliminar productos con confirmacion.
- Mostrar subtotales y total de compra.
- Sincronizar los datos mediante sessionStorage.
- Gestionar errores HTTP y de conexion.
- Diseno responsivo.

## Endpoints

GET /api/products?page=1&limit=4

GET /api/products/:id

GET /api/cart

POST /api/cart/items

PATCH /api/cart/items/:productId

DELETE /api/cart/items/:productId

Las solicitudes del carrito utilizan el header:

    x-user: ana

## Persistencia de datos

Los productos se almacenan en:

    src/data/products.json

Los carritos se almacenan en:

    src/data/carrito.json

El backend conserva el carrito oficial del usuario.

El navegador guarda una copia temporal utilizando
sessionStorage con la clave:

    ecommerce.cart.ana

Esta copia se actualiza despues de consultar el servidor.

Si el servidor no esta disponible, la aplicacion muestra
la ultima copia guardada, informa de que los datos no
estan actualizados y deshabilita las modificaciones.

## Pruebas

El archivo test/requests.http contiene las solicitudes
necesarias para verificar el funcionamiento de la API
mediante la extension REST Client de Visual Studio Code.

## Alcance

No se implementan pagos, autenticacion real ni
administracion de productos, ya que estas funcionalidades
no forman parte de los requisitos obligatorios.