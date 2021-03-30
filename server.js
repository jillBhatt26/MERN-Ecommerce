// Requires
// ----------------------------------

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const { connect } = require('mongoose');
const cookieParser = require('cookie-parser');

// routes
const memberRoutes = require('./routes/MemberRoutes');
const productRoutes = require('./routes/ProductRoutes');
const cartRoutes = require('./routes/CartRoutes');
const orderRoutes = require('./routes/OrderRoutes');

// INIT, CONFIG, APP Middleware
// ----------------------------------

const app = express();

app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config();

app.use(fileUpload());

// MONGODB Connection
// ----------------------------------

const dbURI = `mongodb://localhost:27017/${process.env.DB_NAME}`;

connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    // LISTEN
    // ----------------------------------

    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || 'localhost';

    app.listen(PORT, HOST, err => {
        if (err) console.log(err);
        else {
            console.log(`App hosted on ${HOST}:${PORT}`);
        }
    });
});

app.use('/member', memberRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
