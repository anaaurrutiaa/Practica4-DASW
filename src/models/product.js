import generateUUID from "../utils/generate.uuid.js";

class ProductException {
  constructor(errorMessage) {
    this.errorMessage = errorMessage;
  }
}

class Product {
  constructor(
    title,
    description,
    imageUrl,
    unit,
    stock,
    pricePerUnit,
    category
  ) {
    this._uuid = generateUUID();
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
    this.unit = unit;
    this.stock = stock;
    this.pricePerUnit = pricePerUnit;
    this.category = category;
  }

  get uuid() {
    return this._uuid;
  }
  set uuid(value) {
    throw new ProductException("Product uuids are auto-generated.");
  }

  get title() {
    return this._title;
  }
  set title(value) {
    if (typeof value !== "string" || value === "") {
      throw new ProductException("Product title cannot be empty.");
    }
    this._title = value;
  }

  get description() {
    return this._description;
  }
  set description(value) {
    if (typeof value !== "string" || value === "") {
      throw new ProductException("Product description cannot be empty.");
    }
    this._description = value;
  }

  get imageUrl() {
    return this._imageUrl;
  }
  set imageUrl(value) {
    if (typeof value !== "string" || value === "") {
      throw new ProductException("Product image URL cannot be empty.");
    }
    this._imageUrl = value;
  }

  get unit() {
    return this._unit;
  }
  set unit(value) {
    if (typeof value !== "string" || value === "") {
      throw new ProductException("Product unit cannot be empty.");
    }
    this._unit = value;
  }

  get stock() {
    return this._stock;
  }
  set stock(value) {
    if (typeof value !== "number" || value < 0) {
      throw new ProductException(
        "Product stock must be a valid positive number."
      );
    }
    this._stock = value;
  }

  get pricePerUnit() {
    return this._pricePerUnit;
  }
  set pricePerUnit(value) {
    if (typeof value !== "number" || value < 0) {
      throw new ProductException(
        "Product price per unit must be a valid positive number."
      );
    }
    this._pricePerUnit = value;
  }

  get category() {
    return this._category;
  }
  set category(value) {
    if (typeof value !== "string" || value === "") {
      throw new ProductException("Product category cannot be empty.");
    }
    this._category = value;
  }

  static createFromJson(jsonValue) {
    let obj = JSON.parse(jsonValue);
    return Product.createFromObject(obj);
  }

  static createFromObject(obj) {
    let newProduct = {};
    Object.assign(newProduct, obj); // This will clone original object, but also handle possible non-object values.
    Product.cleanObject(newProduct);

    let product = new Product(
      newProduct.title,
      newProduct.description,
      newProduct.imageUrl,
      newProduct.unit,
      newProduct.stock,
      newProduct.pricePerUnit,
      newProduct.category
    );
    if ("uuid" in newProduct) {
      product._uuid = newProduct.uuid;
    }
    return product;
  }

  static cleanObject(obj) {
    const productProperties = [
      "uuid",
      "title",
      "description",
      "imageUrl",
      "unit",
      "stock",
      "pricePerUnit",
      "category",
    ];
    for (let prop in obj) {
      if (prop.startsWith("_")) {
        obj[prop.substring(1)] = obj[prop];
      }
      if (!productProperties.includes(prop)) {
        delete obj[prop];
      }
    }
  }
}

export default Product;
