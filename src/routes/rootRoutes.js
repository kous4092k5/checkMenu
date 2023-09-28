
import express from 'express';
import productRouter from './product.routes.js';
import authRouter from './auth.routes.js';
import categoriesRouter from './category.routes.js';
const router = express.Router();
const rootRoutes = [
    productRouter,
    authRouter,
    categoriesRouter
];
rootRoutes.map((route) => {
  router.use(route);
});
export default rootRoutes;
