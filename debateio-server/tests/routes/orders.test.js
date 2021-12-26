const faker = require("faker");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../../server");
const UserDao = require("../../server/data/UserDao");
const ProductDao = require("../../server/data/ProductDao");
const OrderDao = require("../../server/data/OrderDao");
const { createToken } = require("../../server/util/token");

const users = new UserDao();
const products = new ProductDao();
const orders = new OrderDao();
const request = supertest(app);

const endpoint = "/api/orders";

describe(`Test ${endpoint} endpoints`, () => {
  const tokens = {};
  let sampleCustomers = [];
  let sampleCustomer0Order1;
  let sampleCustomer1Order1;
  let productArr = [];
  let invalidProductArr = [];
  let manyProductArr1 = [];
  let macBook = {};
  let theBible = {};

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    // You may want to do more in here, e.g. initialize
    // the variables used by all the tests!

    tokens.admin = await createToken({ role: "ADMIN" });
    tokens.invalid = tokens.admin
      .split("")
      .sort(function() {
        return 0.5 - Math.random();
      })
      .join("");
    tokens.customer = await createToken({ role: "CUSTOMER" });
    tokens.expiredAdmin = await createToken({ role: "ADMIN" }, -1);

    sampleCustomers[0] = await users.create({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: "CUSTOMER",
    });

    sampleCustomers[1] = await users.create({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: "CUSTOMER",
    });

    sampleCustomers[2] = await users.create({
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: "ADMIN",
    });

    theBible = await products.create({ name: "The Bible", price: 10 });
    macBook = await products.create({ name: "MacBook Pro", price: 2000 });
    productArr = [
      {
        quantity: 1,
        product: theBible._id.toString()
      }
    ];
    invalidProductArr = [
      {
        quantity: 1,
        product: macBook._id.toString()
      },
      {
        quantity: -1,
        product: theBible._id.toString()
      }
    ];
    manyProductArr1 = [
      {
        quantity: 2,
        product: theBible._id.toString()
      },
      {
        quantity: 3,
        product: macBook._id.toString()
      }
    ]

    // Customer0 has 1 order, Customer1 has 2 orders
    sampleCustomer0Order1 = await orders.create({ customer: sampleCustomers[0]._id.toString(), products: productArr });
    sampleCustomer1Order1 = await orders.create({ customer: sampleCustomers[1]._id.toString(), products: productArr });
    await orders.create({ customer: sampleCustomers[1]._id.toString(), products: productArr });
    await orders.update(sampleCustomer1Order1._id.toString(), sampleCustomers[1]._id.toString(), { status: "COMPLETE" });
  });

  describe(`Test GET ${endpoint}`, () => {

    beforeAll(async () => {
      
    });

    test("Return 403 for missing token", async () => {
      const response = await request.get(endpoint);
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      // TODO Implement me!
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for unauthorized token", async () => {
      // An admin can see any order, however a customer should not be allowed to
      //  see other customers' orders
      // TODO Implement me!
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens.customer}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      // TODO Implement me!
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    describe("Return 200 and list of orders for successful request", () => {
      test("Admin can see any order", async () => {
        // TODO Implement me!
        const response = await request
          .get(endpoint)
          .set("Authorization", `Bearer ${tokens.admin}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(3);
      });
    });

    describe(`Test GET ${endpoint} with query parameter`, () => {
      describe("Admin can see any order", () => {
        test("Return 200 and the order for a given customer", async () => {
          // TODO Implement me!
          const response1 = await request
            .get(`${endpoint}?customer=${sampleCustomers[0]._id.toString()}`)
            .set("Authorization", `Bearer ${tokens.admin}`);
          expect(response1.status).toBe(200);
          expect(response1.body.data.length).toBe(1);
          expect(response1.body.data[0].customer).toBe(sampleCustomers[0]._id.toString());
          const response2 = await request
            .get(`${endpoint}?customer=${sampleCustomers[1]._id.toString()}`)
            .set("Authorization", `Bearer ${tokens.admin}`);
          expect(response2.status).toBe(200);
          expect(response2.body.data.length).toBe(2);
          for (let order of response2.body.data) {
            expect(order.customer).toBe(sampleCustomers[1]._id.toString());
          }
        });

        test("Return 200 and the orders with status of ACTIVE", async () => {
          // TODO Implement me!
          const response = await request
            .get(`${endpoint}?status=ACTIVE`)
            .set("Authorization", `Bearer ${tokens.admin}`);
          expect(response.status).toBe(200);
          expect(response.body.data.length).toBe(2);
          for (let order of response.body.data) {
            expect(order.status).toBe("ACTIVE");
          }
        });

        test("Return 200 and the orders with status of COMPLETE", async () => {
          // TODO Implement me!
          const response = await request
            .get(`${endpoint}?status=COMPLETE`)
            .set("Authorization", `Bearer ${tokens.admin}`);
          expect(response.status).toBe(200);
          expect(response.body.data.length).toBe(1);
          expect(response.body.data[0].status).toBe("COMPLETE");
        });
      });

      describe("Customer can see their order(s)", () => {
        test("Return 200 and the order for a given customer", async () => {
          // TODO Implement me!
          const sampleCustomer0Token = createToken(sampleCustomers[0]);
          const response1 = await request
            .get(`${endpoint}?customer=${sampleCustomers[0]._id.toString()}`)
            .set("Authorization", `Bearer ${sampleCustomer0Token}`);
          expect(response1.status).toBe(200);
          expect(response1.body.data.length).toBe(1);
          let order = response1.body.data[0];
          expect(order.products[0].quantity).toBe(1);
          expect(order.products[0].product).toBe(theBible._id.toString());
          expect(order.products.length).toBe(1);
          expect(order.total).toBe(10);
          expect(order.status).toBe("ACTIVE");
          expect(order.customer).toBe(sampleCustomers[0]._id.toString());
          const sampleCustomer1Token = createToken(sampleCustomers[1]);
          const response2 = await request
            .get(`${endpoint}?customer=${sampleCustomers[1]._id.toString()}`)
            .set("Authorization", `Bearer ${sampleCustomer1Token}`);
          expect(response2.status).toBe(200);
          expect(response2.body.data.length).toBe(2);
          order = response2.body.data[0];
          expect(order.products[0].quantity).toBe(1);
          expect(order.products[0].product).toBe(theBible._id.toString());
          expect(order.products.length).toBe(1);
          expect(order.total).toBe(10);
          expect(order.status).toBe("COMPLETE");
          expect(order.customer).toBe(sampleCustomers[1]._id.toString());
          order = response2.body.data[1];
          expect(order.products[0].quantity).toBe(1);
          expect(order.products[0].product).toBe(theBible._id.toString());
          expect(order.products.length).toBe(1);
          expect(order.total).toBe(10);
          expect(order.status).toBe("ACTIVE");
          expect(order.customer).toBe(sampleCustomers[1]._id.toString());
        });

        test("Return 200 and this customer's orders with status of ACTIVE", async () => {
          // TODO Implement me!
          const sampleCustomer0Token = createToken(sampleCustomers[0]);
          const response1 = await request
            .get(`${endpoint}?customer=${sampleCustomers[0]._id.toString()}&status=ACTIVE`)
            .set("Authorization", `Bearer ${sampleCustomer0Token}`);
          expect(response1.status).toBe(200);
          expect(response1.body.data.length).toBe(1);
          const sampleCustomer1Token = createToken(sampleCustomers[1]);
          const response2 = await request
            .get(`${endpoint}?customer=${sampleCustomers[1]._id.toString()}&status=ACTIVE`)
            .set("Authorization", `Bearer ${sampleCustomer1Token}`);
          expect(response2.status).toBe(200);
          expect(response2.body.data.length).toBe(1);
        });

        test("Return 200 and this customer's orders with status of COMPLETE", async () => {
          // TODO Implement me!
          const sampleCustomer0Token = createToken(sampleCustomers[0]);
          const response1 = await request
            .get(`${endpoint}?customer=${sampleCustomers[0]._id.toString()}&status=COMPLETE`)
            .set("Authorization", `Bearer ${sampleCustomer0Token}`);
          expect(response1.status).toBe(200);
          expect(response1.body.data.length).toBe(0);
          const sampleCustomer1Token = createToken(sampleCustomers[1]);
          const response2 = await request
            .get(`${endpoint}?customer=${sampleCustomers[1]._id.toString()}&status=COMPLETE`)
            .set("Authorization", `Bearer ${sampleCustomer1Token}`);
          expect(response2.status).toBe(200);
          expect(response2.body.data.length).toBe(1);
        });
      });

      test("Return 200 and an empty list for orders with invalid customer query", async () => {
        // TODO Implement me!
        const response = await request
          .get(`${endpoint}?customer=${"customerthatdoesntexist"}`)
          .set("Authorization", `Bearer ${tokens.admin}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(0);
      });

      test("Return 200 and an empty list for orders with invalid status query", async () => {
        // TODO Implement me!
        const response1 = await request
          .get(`${endpoint}?status=WEEWOO`)
          .set("Authorization", `Bearer ${tokens.admin}`);
        expect(response1.status).toBe(200);
        expect(response1.body.data.length).toBe(0);
        const sampleCustomer0Token = createToken(sampleCustomers[0]);
        const response2 = await request
          .get(`${endpoint}?customer=${sampleCustomers[0]._id.toString()}&status=WEEWOO`)
          .set("Authorization", `Bearer ${sampleCustomer0Token}`);
        expect(response2.status).toBe(200);
        expect(response2.body.data.length).toBe(0);
      });
    });
  });

  describe(`Test GET ${endpoint}/:id`, () => {
    test("Return 404 for invalid order ID", async () => {
      // TODO Implement me!
      const id = (new mongoose.Types.ObjectId()).toString();
      const response1 = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response1.status).toBe(404);
      const sampleCustomer0Token = createToken(sampleCustomers[0]);
      const response2 = await request
        .get(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${sampleCustomer0Token}`);
      expect(response2.status).toBe(404);
      const response3 = await request
        .get(`${endpoint}/1234567890`)
        .set("Authorization", `Bearer ${tokens.admin}`);
      expect(response2.status).toBe(404);
    });

    test("Return 403 for missing token", async () => {
      // TODO Implement me!
      const response = await request
        .get(`${endpoint}/${sampleCustomer1Order1._id.toString()}`)
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      const response = await request
        .get(`${endpoint}/${sampleCustomer1Order1._id.toString()}`)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for unauthorized token", async () => {
      // An admin can see any order, however a customer should not be allowed to
      //  see other customers' orders
      // TODO Implement me!
      const sampleCustomer0Token = createToken(sampleCustomers[0]);
      const sampleCustomer1Token = createToken(sampleCustomers[1]);
      const response1 = await request
        .get(`${endpoint}/${sampleCustomer1Order1._id.toString()}`)
        .set("Authorization", `Bearer ${sampleCustomer0Token}`);
      expect(response1.status).toBe(403);
      const response2 = await request
        .get(`${endpoint}/${sampleCustomer0Order1._id.toString()}`)
        .set("Authorization", `Bearer ${sampleCustomer1Token}`);
      expect(response2.status).toBe(403); 
    });

    test("Return 403 for expired token", async () => {
      // TODO Implement me!
      const response = await request
        .get(`${endpoint}/${sampleCustomer0Order1._id.toString()}`)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`)
      expect(response.status).toBe(403);
    });

    describe("Return 200 and the order for successful request", () => {
      test("Admin can see any order", async () => {
        // TODO Implement me!
        const response1 = await request
          .get(`${endpoint}/${sampleCustomer0Order1._id.toString()}`)
          .set("Authorization", `Bearer ${tokens.admin}`);
        expect(response1.status).toBe(200);
        expect(response1.body.data.customer === sampleCustomers[0]._id);
        const response2 = await request
          .get(`${endpoint}/${sampleCustomer1Order1._id.toString()}`)
          .set("Authorization", `Bearer ${tokens.admin}`);
        expect(response2.status).toBe(200);
        expect(response2.body.data.customer === sampleCustomers[1]._id);
        expect(response2.body.data.status === "COMPLETE");
      });

      test("Customer can see their order only", async () => {
        // TODO Implement me!
        const sampleCustomer0Token = createToken(sampleCustomers[0]);
        const response1 = await request
          .get(`${endpoint}/${sampleCustomer0Order1._id.toString()}`)
          .set("Authorization", `Bearer ${sampleCustomer0Token}`);
        expect(response1.status).toBe(200);
        expect(response1.body.data.customer === sampleCustomers[0]._id);
        const sampleCustomer1Token = createToken(sampleCustomers[1]);
        const response2 = await request
          .get(`${endpoint}/${sampleCustomer1Order1._id.toString()}`)
          .set("Authorization", `Bearer ${sampleCustomer1Token}`);
        expect(response2.status).toBe(200);
        expect(response2.body.data.customer === sampleCustomers[1]._id);
        expect(response2.body.data.status === "COMPLETE");
      });
    });
  });

  describe(`Test POST ${endpoint}`, () => {
    test("Return 403 for missing token", async () => {
      // TODO Implement me!
      const response = await request.post(endpoint);
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      // TODO Implement me!
      const response = await request
        .post(endpoint)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    test("Return 403 for expired token", async () => {
      // TODO Implement me!
      const response = await request
        .post(endpoint)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 400 for missing customer", async () => {
      // TODO Implement me!
      const customer = {
        "username": "customer1",
        "password": "$2b$10$Dih.dVACo3jYRk/nxRE8mua1rYFM/HD4tPytk509a2QLlcs8ltfpy",
        "role": "CUSTOMER"
      }
      const customerToken = createToken(customer);
      const response = await request
        .post(endpoint)
        .send({
          products: productArr
        })
        .set("Authorization", `Bearer ${customerToken}`)
      expect(response.status).toBe(400);
    });

    test("Return 404 for non-existing customer", async () => {
      // A token with a user ID that resembles a valid mongoose ID
      //  however, there is no user in the database with that ID!
      // TODO Implement me!
      const customer = {
        _id: new mongoose.Types.ObjectId(),
        username: "customer1",
        password: "$2b$10$Dih.dVACo3jYRk/nxRE8mua1rYFM/HD4tPytk509a2QLlcs8ltfpy",
        role: "CUSTOMER"
      }
      const customerToken = createToken(customer);
      const response = await request
        .post(endpoint)
        .send({
          products: productArr
        })
        .set("Authorization", `Bearer ${customerToken}`)
      expect(response.status).toBe(404);
    });

    test("Return 400 for missing payload", async () => {
      // TODO Implement me!
      const customerID = (new mongoose.Types.ObjectId()).toString();
      const customerToken = createToken(customerID);
      const response = await request
        .post(endpoint)
        .set("Authorization", `Bearer ${customerToken}`)
      expect(response.status).toBe(400);
    });

    test("Return 400 for invalid quantity attribute", async () => {
      // Quantity attribute for each product must be a positive value.
      // TODO Implement me!
      const customerID = (new mongoose.Types.ObjectId()).toString();
      const customerToken = createToken(customerID);
      const response = await request
        .post(endpoint)
        .send({
          products: [
            {
              quantity: -1,
              product: "1234567890"
            },
            ...invalidProductArr
          ]
        })
        .set("Authorization", `Bearer ${customerToken}`);
      expect(response.status).toBe(400);
    });

    test("Return 404 for non-existing product attribute", async () => {
      // A product ID that resembles a valid mongoose ID
      //  however, there is no product in the database with that ID!
      // TODO Implement me!
      const customerToken = createToken(sampleCustomers[2]);
      const response = await request
        .post(endpoint)
        .send({
          products: [
            {
              quantity: 1,
              product: (new mongoose.Types.ObjectId()).toString()
            }
          ]
        })
        .set("Authorization", `Bearer ${customerToken}`);
      expect(response.status).toBe(404);
    });

    test("Return 400 for invalid product attribute", async () => {
      // A product ID that is not even a valid mongoose ID!
      // TODO Implement me!
      const sampleCustomer0 = sampleCustomers[0]._id.toString();
      const sampleCustomer0Token = createToken(sampleCustomer0);
      const response = await request
        .post(endpoint)
        .send({
          products: [
            {
              quantity: 1,
              product: "1234567890"
            }
          ]
        })
        .set("Authorization", `Bearer ${sampleCustomer0Token}`);
      expect(response.status).toBe(400);
    });

    test("Return 201 and the order for successful request", async () => {
      // The "customer" who places the order must be identified through
      //  the authorization token.
      // Moreover, when an order is placed, its status is ACTIVE.
      // The client only provides the list of products.
      // The API shall calculate the total price!
      // TODO Implement me!
      const customer0 = sampleCustomers[0]._id.toString();
      const customer0Token = createToken(sampleCustomers[0]);
      const response1 = await request
        .post(endpoint)
        .send({
          products: manyProductArr1
        })
        .set("Authorization", `Bearer ${customer0Token}`);
      expect(response1.status).toBe(201);
      let order = response1.body.data;
      expect(order.status).toBe("ACTIVE");
      expect(order.total).toBe(6020);
      expect(order.customer).toBe(customer0);
      expect(order.products.length).toBe(2);

      const customer2 = sampleCustomers[2]._id.toString();
      const customer2Token = createToken(sampleCustomers[2]);
      const response2 = await request
        .post(endpoint)
        .send({
          products: manyProductArr1
        })
        .set("Authorization", `Bearer ${customer2Token}`);
      expect(response2.status).toBe(201);
      order = response2.body.data;
      expect(order.status).toBe("ACTIVE");
      expect(order.total).toBe(6020);
      expect(order.customer).toBe(customer2);
      expect(order.products.length).toBe(2);
    });
  });

  describe(`Test PUT ${endpoint}/:id`, () => {
    test("Return 404 for invalid order ID", async () => {
      // TODO Implement me!
      const id = new mongoose.Types.ObjectId();
      const customerToken = createToken(sampleCustomers[0]);
      const response = await request
        .put(`${endpoint}/${id.toString()}`)
        .send({
          products: productArr,
          status: "ACTIVE"
        })
        .set("Authorization", `Bearer ${customerToken}`);
      expect(response.status).toBe(404);
    });

    test("Return 403 for missing token", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const response = await request
        .put(`${endpoint}/${id}`)
        .send({
          products: productArr,
          status: "ACTIVE"
        });
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const response = await request
        .put(`${endpoint}/${id}`)
        .send({
          products: productArr,
          status: "ACTIVE"
        })
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    describe("Return 403 for unauthorized token", () => {
      test("Admins not allowed to update others' orders", async () => {
        // TODO Implement me!
        const id = sampleCustomer0Order1._id.toString();
        const adminToken = createToken(sampleCustomers[2]);
        const response = await request
          .put(`${endpoint}/${id}`)
          .send({
            products: productArr,
            status: "ACTIVE"
          })
          .set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(403); 
      });

      test("Customers not allowed to update others' orders", async () => {
        // TODO Implement me!
        const customer0Token = createToken(sampleCustomers[0]);
        const customer1Token = createToken(sampleCustomers[1]);
        const customer0OrderId = sampleCustomer0Order1._id.toString();
        const customer1OrderId = sampleCustomer1Order1._id.toString();
        const response1 = await request
          .put(`${endpoint}/${customer0OrderId}`)
          .send({
            products: productArr,
            status: "ACTIVE"
          })
          .set("Authorization", `Bearer ${customer1Token}`);
        expect(response1.status).toBe(403);
        const response2 = await request
          .put(`${endpoint}/${customer1OrderId}`)
          .send({
            products: productArr,
            status: "ACTIVE"
          })
          .set("Authorization", `Bearer ${customer0Token}`);
        expect(response2.status).toBe(403);
      });
    });

    test("Return 403 for expired token", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const response = await request
        .put(`${endpoint}/${id}`)
        .send({
          products: productArr,
          status: "ACTIVE"
        })
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 400 for missing payload", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const customer0Token = createToken(sampleCustomers[0]);
      const response = await request
        .put(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${customer0Token}`)
      expect(response.status).toBe(400);
    });

    test("Return 400 for invalid status attribute", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const customer0Token = createToken(sampleCustomers[0]);
      const response = await request
        .put(`${endpoint}/${id}`)
        .send({
          products: productArr,
          status: "WEEWOO"
        })
        .set("Authorization", `Bearer ${customer0Token}`);
      expect(response.status).toBe(400);
    });

    test("Return 400 for invalid quantity attribute", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const customer0Token = createToken(sampleCustomers[0]);
      const response = await request
        .put(`${endpoint}/${id}`)
        .send({
          products: invalidProductArr,
          status: "ACTIVE"
        })
        .set("Authorization", `Bearer ${customer0Token}`);
      expect(response.status).toBe(400);
    });

    describe("Return 200 and the updated order for successful request", () => {
      test("Update products, e.g., add/remove or change quantity", async () => {
        // TODO Implement me!
        // Add products
        let id = sampleCustomer0Order1._id;
        const customer0Token = createToken(sampleCustomers[0]);
        let response = await request
          .put(`${endpoint}/${id}`)
          .send({
            products: [
              {
                quantity: 2,
                product: macBook._id.toString()
              },
              ...sampleCustomer0Order1.products
            ]
          })
          .set("Authorization", `Bearer ${customer0Token}`);
        expect(response.status).toBe(200);
        let order = response.body.data;
        expect(order.products[1].quantity).toBe(1);
        expect(order.products[1].product).toBe(theBible._id.toString());
        expect(order.products[0].quantity).toBe(2);
        expect(order.products[0].product).toBe(macBook._id.toString());
        expect(order.products.length).toBe(2);
        expect(order.total).toBe(4010);
        expect(order.status).toBe("ACTIVE");
        expect(order.customer).toBe(sampleCustomers[0]._id.toString());

        // Remove products
        response = await request
          .put(`${endpoint}/${id}`)
          .send({
            products: [order.products[1]]
          })
          .set("Authorization", `Bearer ${customer0Token}`);
        expect(response.status).toBe(200);
        order = response.body.data;
        expect(order.products[0].quantity).toBe(1);
        expect(order.products[0].product).toBe(theBible._id.toString());
        expect(order.products.length).toBe(1);
        expect(order.total).toBe(10);
        expect(order.status).toBe("ACTIVE");
        expect(order.customer).toBe(sampleCustomers[0]._id.toString());

        // Change quantity
        response = await request
          .put(`${endpoint}/${id}`)
          .send({
            products: [
              {
                quantity: 2,
                product: order.products[0].product
              }
            ]
          })
          .set("Authorization", `Bearer ${customer0Token}`);
        expect(response.status).toBe(200);
        order = response.body.data;
        expect(order.products[0].quantity).toBe(2);
        expect(order.products[0].product).toBe(theBible._id.toString());
        expect(order.products.length).toBe(1);
        expect(order.total).toBe(20);
        expect(order.status).toBe("ACTIVE");
        expect(order.customer).toBe(sampleCustomers[0]._id.toString());
        //Revert
        await request
          .put(`${endpoint}/${id}`)
          .send({
            products: [
              {
                quantity: 1,
                product: order.products[0].product
              }
            ]
          })
          .set("Authorization", `Bearer ${customer0Token}`);
      });

      test("Update status, e.g., from ACTIVE to COMPLETE", async () => {
        // TODO Implement me!
        let id = sampleCustomer0Order1._id;
        const customer0Token = createToken(sampleCustomers[0]);
        let response = await request
          .put(`${endpoint}/${id}`)
          .send({
            status: "COMPLETE"
          })
          .set("Authorization", `Bearer ${customer0Token}`);
        expect(response.status).toBe(200);
        let order = response.body.data;
        expect(order.products[0].quantity).toBe(1);
        expect(order.products[0].product).toBe(theBible._id.toString());
        expect(order.products.length).toBe(1);
        expect(order.total).toBe(10);
        expect(order.status).toBe("COMPLETE");
        expect(order.customer).toBe(sampleCustomers[0]._id.toString());
        //Revert
        await request
          .put(`${endpoint}/${id}`)
          .send({
            status: "ACTIVE"
          })
          .set("Authorization", `Bearer ${customer0Token}`);
      });
    });
  });

  describe(`Test DELETE ${endpoint}/:id`, () => {
    test("Return 404 for invalid order ID", async () => {
      // TODO Implement me!
      const id = (new mongoose.Types.ObjectId()).toString();
      const customerToken = createToken(sampleCustomers[0]);
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(response.status).toBe(404);
    });

    test("Return 403 for missing token", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const response = await request
        .delete(`${endpoint}/${id}`)
      expect(response.status).toBe(403);
    });

    test("Return 403 for invalid token", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.invalid}`);
      expect(response.status).toBe(403);
    });

    describe("Return 403 for unauthorized token", () => {
      test("Admins not allowed to delete others' orders", async () => {
        // TODO Implement me!
        let id = sampleCustomer0Order1._id.toString();
        const adminToken = createToken(sampleCustomers[2]);
        let response = await request
          .delete(`${endpoint}/${id}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(403);
        id = sampleCustomer1Order1._id.toString();
        response = await request
          .delete(`${endpoint}/${id}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(response.status).toBe(403); 
      });

      test("Customers not allowed to delete others' orders", async () => {
        // TODO Implement me!
        const customer0Order = sampleCustomer0Order1._id.toString();
        const customer1Order = sampleCustomer1Order1._id.toString();
        const customer0Token = createToken(sampleCustomers[0]);
        const customer1Token = createToken(sampleCustomers[1]);
        let response = await request
          .delete(`${endpoint}/${customer0Order}`)
          .set("Authorization", `Bearer ${customer1Token}`);
        expect(response.status).toBe(403);
        response = await request
          .delete(`${endpoint}/${customer1Order}`)
          .set("Authorization", `Bearer ${customer0Token}`);
        expect(response.status).toBe(403); 
      });
    });

    test("Return 403 for expired token", async () => {
      // TODO Implement me!
      const id = sampleCustomer0Order1._id.toString();
      const response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${tokens.expiredAdmin}`);
      expect(response.status).toBe(403);
    });

    test("Return 200 and the deleted order for successful request", async () => {
      // A customer may delete their order!
      // TODO Implement me!
      let id = sampleCustomer0Order1._id.toString();
      let customerToken = createToken(sampleCustomers[0]);
      let response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(response.status).toBe(200);
      let order = response.body.data;
      expect(order.products[0].quantity).toBe(1);
      expect(order.products[0].product).toBe(theBible._id.toString());
      expect(order.products.length).toBe(1);
      expect(order.total).toBe(10);
      expect(order.status).toBe("ACTIVE");
      expect(order.customer).toBe(sampleCustomers[0]._id.toString());
      id = sampleCustomer1Order1._id.toString();
      customerToken = createToken(sampleCustomers[1]);
      response = await request
        .delete(`${endpoint}/${id}`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(response.status).toBe(200);
      order = response.body.data;
      expect(order.products[0].quantity).toBe(1);
      expect(order.products[0].product).toBe(theBible._id.toString());
      expect(order.products.length).toBe(1);
      expect(order.total).toBe(10);
      expect(order.status).toBe("COMPLETE");
      expect(order.customer).toBe(sampleCustomers[1]._id.toString());
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });
});
