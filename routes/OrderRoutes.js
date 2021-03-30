// Requires
// ----------------------------------

// router
const { Router } = require('express');
const {
    FetchOrdersSeller,
    PlaceOrder,
    CancelOrder,
    UpdateOrderSeller,
    FetchOrdersMember
} = require('../controllers/OrderControllers');

// Middleware
const LoggedInMember = require('../middleware/LoggedInMember');
const VerifySeller = require('../middleware/VerifySeller');

// Router INIT
// ----------------------------------
const router = Router();

// Routes Definitions
// ----------------------------------
router.post('/place', LoggedInMember, PlaceOrder);
router.delete('/cancel', LoggedInMember, CancelOrder);
router.put('/seller/update', VerifySeller, UpdateOrderSeller);
router.get('/member/fetchAll', LoggedInMember, FetchOrdersMember);
router.get('/seller/fetchAll', VerifySeller, FetchOrdersSeller);

// Requires
// ----------------------------------
module.exports = router;
