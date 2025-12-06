'use strict';
const request = require('supertest');

const app = 'http://localhost:4001';

describe("Auth & Itinerary API Endpoints", () => {

    const userData = {
        name: "vijender",
        email: "test@gmail.com",
        password: "Vijender"
    };

    let token;

    // -------------------- AUTH TESTS --------------------
    describe("POST /api/auth/login", () => {

        it("should login successfully with correct credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: userData.email, password: userData.password });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.message).toBe("Login successful");
            token = res.body.token;
        });

        it("should fail login with wrong password", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: userData.email, password: "wrongpass" });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe("Invalid email or password");
        });

        it("should fail login for non-existent user", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "notfound@example.com", password: "pass123" });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe("Invalid email or password");
        });
    });

    // -------------------- ITINERARY TESTS --------------------
    describe("Itinerary Endpoints", () => {

        it("should get all itineraries", async () => {
            const res = await request(app)
                .get("/api/itineraries")
                .set("Authorization", token);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
