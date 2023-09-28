import express from "express";

import { create, get, getAll } from "../controllers/category.controller.js";

const categoriesRouter = express.Router();
categoriesRouter.get("/categories", getAll);
categoriesRouter.get("/categories/:id", get);
categoriesRouter.post("/categories", create);

export default categoriesRouter;
