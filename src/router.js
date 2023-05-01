const express = require("express");

const router = express.Router();
const Product = require("./mongo");
const utils = require("./utils");

const response = {
    SUCCESS: {
        status: 200,
        msg: "Success"
    },
    INVALID_PARAMETER: {
        status: 201,
        msg: "Invalid parameter exist"
    },
    NOT_FOUND: {
        status: 404,
        msg: "Product ID Not Exist"
    }
};

router.get("/products", async (req, res) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const categories = req.query.categories;
    const reg = /^[1-9]\d*$/;
    if(!reg.test(page) || !reg.test(limit)) {
        res.status(400).json({ msg: "Invalid parameters" });
        return;
    }
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    try {
        const skip = (pageNumber - 1) * limitNumber;
        const conditions = {};
        if(categories) {
            const categoryArray = categories.split(",");
            conditions.category = { $in: categoryArray };
        }
        const count = await Product.countDocuments(conditions);
        const pageCount = Math.ceil(count / limitNumber);
        const options = { limit: limitNumber, skip };
        const products = await Product.find(conditions, null, options);
        const result = {
            products: products,
            page: pageNumber,
            limit: limitNumber,
            pageTotal: pageCount,
            dataTotal: count
        }
        res.result(response.SUCCESS.status, response.SUCCESS.msg, result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.get("/product", async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.query.id });
        if (!product) {
            res.result(response.NOT_FOUND.status, response.NOT_FOUND.msg, "");
        }
        res.result(response.SUCCESS.status, response.SUCCESS.msg, product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.post("/product", async (req, res) => {
    try {
        let product = req.body;
        product.id = await utils.idIncrement();
        product = utils.convertNumbers(product);
        if(!product) {
            res.result(response.INVALID_PARAMETER.status, response.INVALID_PARAMETER.msg, "");
        }
        const newProduct = await Product.create(product);
        res.result(response.SUCCESS.status, response.SUCCESS.msg, newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.put("/product", async (req, res) => {
    try {
        let product = req.body;
        let destination = await Product.findOne({ id: product.id });
        if (!destination) {
            res.result(response.NOT_FOUND.status, response.NOT_FOUND.msg, "");
        }
        product = utils.convertNumbers(product);
        if(!product) {
            res.result(response.INVALID_PARAMETER.status, response.INVALID_PARAMETER.msg, "");
        }
        await Product.updateOne({ id: product.id }, product);
        res.result(response.SUCCESS.status, response.SUCCESS.msg, "");
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete("/product", async (req, res) => {
    try {
        const id = parseInt(req.query.id);
        const result = await Product.deleteOne({ id: id });
        if (result.deletedCount === 1) {
            res.result(response.SUCCESS.status, response.SUCCESS.msg, "");
        } else {
            res.result(response.NOT_FOUND.status, response.NOT_FOUND.msg, "");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const query = req.query.q;
        const result = await Product.find({ category: { $regex: query, $options: "i" } }).distinct("category");
        res.result(response.SUCCESS.status, response.SUCCESS.msg, result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;