            import dotenv from "dotenv";
            import Product from "../models/product.models.js";
            import { productSchema } from "../schemas/product.schemas.js";
            import Category from "../models/category.models.js";
            dotenv.config();
            export const getAll = async (req, res) => {
                const { _limit = 20, _sort = "createAt", _order = "asc" } = req.query;
                const options = {
                    customLabels: {
                        docs: "data",
                        limit: _limit,
                        sort: {
                            [_sort]: _order === "desc" ? -1 : 1,
                        },
                    },
                };
                try {
                    const products = await Product.paginate({}, options);
                    if (products.length === 0) {
                        return res.status(404).json({
                            message: "Không có sản phẩm nào",
                        });
                    }
                    return res.json({
                        message: "Lấy danh sách sản phẩm thành công",
                        products,
                    });
                } catch (error) {
                    return res.status(400).json({
                        message: error.message,
                    });
                }
            };
            export const get = async (req, res) => {
                try {
                    const product = await Product.findById(req.params.id).populate("categoryId");

                    if (!product) {
                        return res.json({
                            message: "Không tìm thấy sản phẩm",
                        });
                    }
                    return res.json({
                        message: "Lấy sản phẩm thành công",
                        product,
                    });
                } catch (error) {
                    return res.status(400).json({
                        message: error,
                    });
                }
            };
            export const create = async (req, res) => {
                try {
                    // validate
                    const { error } = productSchema.validate(req.body);
                    if (error) {
                        return res.status(400).json({
                            message: error.details[0].message,
                        });
                    }
                    const product = await Product.create(req.body);
                    await Category.findByIdAndUpdate(product.categoryId, {
                        $addToSet: { products: product._id },
                    });
                    if (!product) {
                        return res.json({
                            message: "Thêm sản phẩm không thành công",
                        });
                    }
                    return res.json({
                        message: "Thêm sản phẩm thành công",
                        product,
                    });
                } catch (error) {
                    return res.status(400).json({
                        message: error.message,
                    });
                }
            };
            export const update = async (req, res) => {
                try {
                    const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
                        new: true,
                    });
                    if (!product) {
                        return res.json({
                            message: "Cập nhật sản phẩm không thành công",
                        });
                    }
                    return res.json({
                        message: "Cập nhật sản phẩm thành công",
                        product,
                    });
                } catch (error) {
                    return res.status(400).json({
                        message: error,
                    });
                }
            };
            export const remove = async (req, res) => {
                try {
                    const product = await Product.findByIdAndDelete(req.params.id);
                    return res.json({
                        message: "Xóa sản phẩm thành công",
                        product,
                    });
                } catch (error) {
                    return res.status(400).json({
                        message: error,
                    });
                }
            };

