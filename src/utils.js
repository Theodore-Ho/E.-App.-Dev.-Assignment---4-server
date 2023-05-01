const Product = require("./mongo");

async function idIncrement() {
    const product = await Product.findOne({}, {id: 1}).sort({id: -1});
    return product.id + 1;
}

function convertNumbers(product) {
    const integer = /^[1-9]\d*$/;
    const decimal = /^[0-9]*[.]?[0-9]+$/;

    if(integer.test(product.price)) {
        product.price = parseInt(product.price);
    } else {
        return false;
    }

    if(decimal.test(product.discountPercentage)) {
        product.discountPercentage = parseFloat(product.discountPercentage);
    } else {
        return false;
    }

    if(decimal.test(product.stock)) {
        product.stock = parseInt(product.stock);
    } else {
        return false;
    }

    if(decimal.test(product.rating) && parseFloat(product.rating) <= 5) {
        product.rating = parseFloat(product.rating);
    } else {
        return false;
    }

    return product;
}

module.exports = {
    idIncrement: idIncrement,
    convertNumbers: convertNumbers
};