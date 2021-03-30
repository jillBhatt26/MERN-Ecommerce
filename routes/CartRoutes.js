// Requires
// ----------------------------------
const { Router } = require('express');

// controllers
const {
    AddProductToCart,
    GetCartProducts,
    RemoveProductFromCart,
    UpdateProductInCart,
    EmptyCart
} = require('../controllers/CartControllers');

// middleware
const LoggedInMember = require('../middleware/LoggedInMember');

// Router INIT
// ----------------------------------
const router = Router();

// Routes Definition
// ----------------------------------
router.post('/add', LoggedInMember, AddProductToCart);

router.get('/getItems', LoggedInMember, GetCartProducts);

router.delete('/remove', LoggedInMember, RemoveProductFromCart);

router.put('/update', LoggedInMember, UpdateProductInCart);

router.delete('/empty', LoggedInMember, EmptyCart);

// Router export
// ----------------------------------
module.exports = router;
