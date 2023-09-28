const request = require("supertest");
const app = require("../app"); // your express app
const { User } = require("../models"); // your user model
const bcrypt = require("bcrypt");

describe("POST /signin", () => {
    it("should return 400 if validation fails", async () => {
        const res = await request(app).post("/signin").send({ email: "", password: "123456" });
        expect(res.statusCode).toEqual(400);
    });

    it("should return 400 if user does not exist", async () => {
        const res = await request(app)
            .post("/signin")
            .send({ email: "nonexistentemail@test.com", password: "123456" });

        expect(res.statusCode).toEqual(400);
    });

    it("should return 400 if password is incorrect", async () => {
        // create a sample user and hash the password
        const password = "correcthorsebatterystaple";
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: "test@test.com",
            password: hashedPassword,
        });

        const res = await request(app)
            .post("/signin")
            .send({ email: "test@test.com", password: "wrongpassword" });

        expect(res.statusCode).toEqual(400);
    });

    it("should return a token and user object if signin is successful", async () => {
        // create a sample user and hash the password
        const password = "correcthorsebatterystaple";
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: "test@test.com",
            password: hashedPassword,
        });

        const res = await request(app)
            .post("/signin")
            .send({ email: "test@test.com", password: password });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("accessToken");
        expect(res.body).toHaveProperty("user");
        expect(res.body.user.email).toEqual(user.email);
        expect(res.body.user.password).toBeUndefined();
    });
});
