const express = require("express");

const router = express.Router();
const Product = require("./mongo");

const response = {
    SUCCESS: {
        status: 200,
        msg: "Success"
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