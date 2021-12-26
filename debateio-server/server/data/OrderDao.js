// TODO: Implement the operations of OrderDao.
//  Do not change the signature of any of the operations!
//  You may add helper functions, other variables, etc, as the need arises!
const mongoose = require("mongoose");
const ApiError = require("../model/ApiError");
const ProductDao = require("../../server/data/ProductDao");
const UserDao = require("../../server/data/UserDao");
const Order = require("../model/Order");

const productDao = new ProductDao();
const users = new UserDao();

class OrderDao {
  // When an order is created, it is in "active" state
  async create({ customer, products }) {
    // Hint: Total price is computer from the list of products.

    // TODO Impelment me
    await users.read(customer);

    let total = 0;
    for (let productObj of products) {
      const product = await productDao.read(productObj.product);
      total += productObj.quantity * product.price;
    }

    const order = await Order.create({
      status: "ACTIVE",
      total: total,
      customer: customer,
      products: products
    });
    
    let newProducts = [];
    for (let orderItem of order.products) {
      newProducts.push({
        quantity: orderItem.quantity,
        product: orderItem.product._id.toString()
      });
    }

    return {
      _id: order._id.toString(),
      status: order.status,
      total: order.total,
      customer: order.customer._id.toString(),
      products: products 
    };
  }

  async read(id, customer, role) {
    // Hint:
    //  If role==="ADMIN" then return the order for the given ID
    //  Otherwise, only return it if the customer is the one who placed the order!

    // TODO Implement me!
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(404, "There is no order with the given ID!");
    }
    const order = await Order.findById(id).lean().select("-__v");
    if (order === null) {
      throw new ApiError(404, "There is no order with the given ID!");
    }

    if (role === "ADMIN") {
      return order;
    } else if (role === "CUSTOMER" && (order.customer.toString() === customer)) {
      return order;
    }
    throw new ApiError(403, "You are not authorized to perform this action!");
  }

  // Pre: The requester is an ADMIN or is the customer!
  //  The route handler must verify this!
  async readAll({ customer, status }) {
    // Hint:
    //  The customer and status parameters are filters.
    //  For example, one may search for all "ACTIVE" orders for the given customer.

    // TODO Implement me!
    // if (!mongoose.Types.ObjectId.isValid(customer)) {
    //   return [];
    // }
    
    if (customer && !status) {
      if (!mongoose.Types.ObjectId.isValid(customer)) {
        return [];
      }
      return await Order.find({ customer }).lean().select("-__v");
    } else if (!customer && status) {
      return await Order.find({ status }).lean().select("-__v");
    } else if (!customer && !status) {
      return await Order.find({}).lean().select("-__v");
    }
    return await Order.find({ customer, status }).lean().select("-__v");
  }

  async delete(id, customer) {
    // Hint: The customer must be the one who placed the order!

    // TODO Implement me!
    let order = await Order.findById(id).lean().select("-__v");
    if (order === null) {
      throw new ApiError(404, "There is no order with the given ID!");
    }
    
    if (order.customer.toString() !== customer) {
      throw new ApiError(403, "You are not authorized to perform this action!");
    }

    order = await Order.findByIdAndDelete(id);

    //loop through products and change id's

    return {
      _id: order._id.toString(),
      status: order.status,
      total: order.total,
      customer: order.customer._id.toString(),
      products: order.products 
    };
  }

  // One can update the list of products or the status of an order
  async update(id, customer, { products, status }) {
    // Hint: The customer must be the one who placed the order!

    // TODO Implement me!
    if (status && status !== "ACTIVE" && status !== "COMPLETE") {
      throw new ApiError(400, "Invalid status attribute!");
    }

    if (products) {
      for (let productObj of products) {
        if (productObj.quantity <= 0) {
          throw new ApiError(400, "Invalid quantity attribute for 1 or more products!");
        }
      }
    }

    const customerObj = await users.read(customer);

    const checkOrder = await this.read(id, customer, customerObj.role);

    if (customerObj._id.toString() !== checkOrder.customer.toString()) {
      throw new ApiError(403, "You are not authorized to perform this action!");
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { products, status },
      { new: true, runValidators: true }
    )
      .lean()
      .select("-__v");
    
    let total = 0;
    for (let productObj of order.products) {
      const product = await productDao.read(productObj.product);
      total += productObj.quantity * product.price;
    }

    return {
      _id: order._id.toString(),
      status: order.status,
      total: total,
      customer: order.customer.toString(),
      products: order.products
    };
  }
}

module.exports = OrderDao;
