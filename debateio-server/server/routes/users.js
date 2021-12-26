const express = require("express");
const UserDao = require("../data/UserDao");
const ApiError = require("../model/ApiError");
const { checkAdmin, checkToken } = require("../util/middleware");

const router = express.Router();
const users = new UserDao();

router.get("/api/users", checkToken, checkAdmin, async (req, res, next) => {
  try {
    const { username, role } = req.query;
    if (username && role) {
      throw new ApiError(
        400,
        "You must query the database based on either a username or user role."
      );
    } else {
      const data = username
        ? await users.readOne(username)
        : await users.readAll(role);
      res.json({ data });
    }
  } catch (err) {
    next(err);
  }
});

// Customers should only be able to view their own data
router.get("/api/users/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.role !== "ADMIN" && !(user.role === "CUSTOMER" && user.sub === id)) {
      throw new ApiError(403, "You are not authorized to perform this action.");
    }
    const data = await users.read(id);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/api/users", checkAdmin, async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const data = await users.create({ username, password, role });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/api/users/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.role !== "ADMIN" && !(user.role === "CUSTOMER" && user.sub === id)) {
      throw new ApiError(403, "You are not authorized to perform this action.");
    }
    const data = await users.delete(id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// Customers should only be able to modify their username and password
router.put("/api/users/:id", checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, role } = req.body;
    if (!password && !role) {
      throw new ApiError(400, "You must provide at least one user attribute!");
    }
    const user = req.user;
    let data;
    if (user.role === "ADMIN") {
      data = await users.update(id, { password, role });
    } else if (user.role === "CUSTOMER" && user.sub === id && !role) {
      data = await users.update(id, { password });
    } else {
      throw new ApiError(403, "You are not authorized to perform this action.");
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
