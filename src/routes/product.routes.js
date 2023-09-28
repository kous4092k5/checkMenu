import express from "express";

import { create, get, getAll, remove, update } from "../controllers/product.controller.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const productRouter = express.Router();
productRouter.get("/products", getAll);
productRouter.get("/products/:id", get);
productRouter.post("/products", checkPermission, create);
productRouter.put("/products/:id", checkPermission, update);
productRouter.delete("/products/:id", checkPermission, remove);
export default productRouter;
