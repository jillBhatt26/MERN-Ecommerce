// Requires
// ----------------------------------
const { Router } = require('express');

// controllers
const {
    FetchAllProducts,
    FetchProduct,
    SearchProduct,
    AddNewProduct,
    DeleteProduct,
    UpdateProduct,
    FetchProductsBySeller,
    FetchProductReviews,
    ReviewProduct
} = require('../controllers/ProductControllers');

// middleware
const VerifySeller = require('../middleware/VerifySeller');
const LoggedInMember = require('../middleware/LoggedInMember');

// INIT Router
// ----------------------------------
const router = Router();

// Routes definition
// ----------------------------------

// NOTE: Keep all the parameterized routes at the bottom of the non parameterized routes.

// NOTE: Complete product route = http://localhost:5000/product/<< below routes >>

router.get('/sellerProducts', VerifySeller, FetchProductsBySeller);

router.get('/search', SearchProduct);

router.post('/add', VerifySeller, AddNewProduct);

router.get('/all', FetchAllProducts);

router.get('/:id', FetchProduct);

router.delete('/delete/:id', VerifySeller, DeleteProduct);

router.put('/update/:id', VerifySeller, UpdateProduct);

router.get('/reviews/:id', FetchProductReviews);

router.post('/review', LoggedInMember, ReviewProduct);

// Router Export
// ----------------------------------
module.exports = router;
