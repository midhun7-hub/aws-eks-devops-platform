const request = require("supertest");
const app = require("../server");

describe("Payment Service", () => {

    test("GET /health", async () => {
        const res = await request(app).get("/health");

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("UP");
    });

    test("GET /payment", async () => {
        const res = await request(app).get("/payment");

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Payment Service Running");
    });

});