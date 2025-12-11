import express from 'express';
import * as itemController from '../../controllers/customer/itemController.js';
import { optionalAuth } from '../../middlewares/customerAuth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, itemController.getItems);
router.get('/categories', itemController.getCategories);
router.get('/featured', itemController.getFeaturedItems);
router.get('/search', itemController.searchItems);
router.get('/suggestions', optionalAuth, itemController.getItemSuggestions);
router.get('/category/:category', itemController.getItemsByCategory);
router.get('/:id', itemController.getItemById);

export default router;