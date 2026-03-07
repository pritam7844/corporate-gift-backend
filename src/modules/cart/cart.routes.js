import { Router } from 'express';
import { getCart, addToCart } from '../cart/cart.controller.js';
import { isLoggedIn as protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);

export default router;