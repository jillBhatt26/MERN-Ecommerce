// Requires
// ----------------------------------
const { Router } = require('express');

// controllers
const {
    SignUp,
    Login,
    Logout,
    LoggedInUser,
    SellerSignUp,
    FetchOrdersSeller,
    FetchOrdersMember,
    CreateOrder,
    DeleteOrder,
    UpdateOrderBuyer,
    GetSellerInfo,
    FetchMemberInfo,
    AddNewAddress,
    AddNewContact
} = require('../controllers/MemberControllers');

// middleware
const LoggedInMember = require('../middleware/LoggedInMember');
const VerifySeller = require('../middleware/VerifySeller');

// INIT ROUTER
// ----------------------------------
const router = Router();

// Routes Definitions
// ----------------------------------
router.post('/signup', SignUp);

router.post('/login', Login);

router.post('/logout', Logout);

router.get('/loggedin', LoggedInMember, LoggedInUser);

// NOTE: A seller has to be a member and also should be logged in.
router.post('/seller/signup', LoggedInMember, SellerSignUp);

router.get('/seller/fetchOrders', VerifySeller, FetchOrdersSeller);

router.get('/seller/getSellerInfo', VerifySeller, GetSellerInfo);

router.get('/fetchOrders', LoggedInMember, FetchOrdersMember);

router.post('/createOrder', LoggedInMember, CreateOrder);

router.delete('/removeOrder', LoggedInMember, DeleteOrder);

router.put('/updateOrder', LoggedInMember, UpdateOrderBuyer);

// personal information routes

router.get('/memberInfo', LoggedInMember, FetchMemberInfo);

// NOTE: The delete route for member info is also handled using update route. If a member want's the details removed, update the route with an empty information array.
router.put('/memberAddress', LoggedInMember, AddNewAddress);

router.put('/memberContactNum', LoggedInMember, AddNewContact);

// Router Export
// ----------------------------------
module.exports = router;
