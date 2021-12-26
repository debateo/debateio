const express = require("express");
const ApiError = require("../model/ApiError");
const { checkToken } = require("../util/middleware");
const OrderDao = require("../data/OrderDao");
const mongoose = require("mongoose");

const router = express.Router();

const orders = new OrderDao();

router.get("/api/orders", checkToken, async (req, res, next) => {
  const { customer, status } = req.query;
  const user = req.user;
  
  try {
    // TODO Implement Me!
    let data;
    if (user.role === "CUSTOMER") {
      if (customer && user.sub === customer) {
        data = await orders.readAll({ customer, status });
      } else {
        throw new ApiError(403, "You are not authorized to perform this action!");
      }
    } else {
      data = await orders.readAll({ customer, status });
    }
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/api/orders/:id", checkToken, async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    // TODO Implement Me!
    const data = await orders.read(id, user.sub, user.role);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/api/orders", checkToken, async (req, res, next) => {
  const { products } = req.body;
  const user = req.user;
  try {
    if (!user.sub) {
      throw new ApiError(400, "Missing customer!");
    }
    // TODO Implement Me!
    const data = await orders.create({ customer: user.sub, products });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/api/orders/:id", checkToken, async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  try {
    // TODO Implement Me!
    const data = await orders.delete(id, user.sub);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.put("/api/orders/:id", checkToken, async (req, res, next) => {
  const { id } = req.params;
  const { products, status } = req.body;
  const user = req.user;
  try {
    // TODO Implement Me!
    if (!products && !status) {
      throw new ApiError(400, "Missing payload!");
    }
    const data = await orders.update(id, user.sub, { products, status })
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
