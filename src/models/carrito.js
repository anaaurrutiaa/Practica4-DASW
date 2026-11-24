


class Carrito {
    constructor(user, cart){
        this.user = user;
        this.cart = cart;
    }


    static createFromObject(obj) {
    let newCart = {};
    Object.assign(newCart, obj); // This will clone original object, but also handle possible non-object values.

    let cart = new Carrito(
      newCart.user,
      newCart.cart
    );

    return cart;
  }
}

export default Carrito;