import express from 'express'
import {createProduct, createProductReview, deleteProduct, getProductById, getProducts, updateProduct} from '../controllers/productControllers.js'
const router = express.Router()
import { admin, protect } from '../middleware/authMiddleware.js'

router.route('/').get(getProducts).post(protect, admin, createProduct)
router.route('/:id/reviews').post(protect, createProductReview)
router.route('/:id')
    .get(getProductById)
    .delete(protect, admin, deleteProduct)
    .put(protect, admin, updateProduct)


export default router;