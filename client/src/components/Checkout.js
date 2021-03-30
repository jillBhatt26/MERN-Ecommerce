// hooks
import { useEffect, useContext, useState } from 'react';

// axios
import axios from 'axios';

// react-router-dom
import { useHistory } from 'react-router-dom';

// contexts
import { AppContext } from '../contexts/AppContext';

// Elements to add
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// 5. Place Order using Payment gateway.

const Checkout = () => {
    // contexts
    const { cart } = useContext(AppContext);

    // useHistory
    const history = useHistory();

    // states
    const [toAddAddress, setToAddAddress] = useState(false);
    const [toAddContact, setToAddContact] = useState(false);

    // states from response
    const [address, setAddress] = useState([]);
    const [contact, setContact] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');

    // address input values
    const [line_1, setLine1] = useState('');
    const [line_2, setLine2] = useState('');
    const [line_3, setLine3] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pin, setPin] = useState('');

    // contact number value
    const [contactNum, setContactNum] = useState('');

    // cart state
    const [cartProducts, setCartProducts] = useState([]);

    // order summary states
    const [totalItems, setTotalItems] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [shipmentCharge, setShipmentCharge] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [payAmount, setPayAmount] = useState();
    const [taxAmount, setTaxAmount] = useState(0);

    // componentDidMount
    useEffect(() => {
        const M = window.M;

        M.AutoInit();
    }, []);

    useEffect(() => {
        // set the total items to the length of the cart
        setTotalItems(cart.items.length);
        // make a request to fetch product details using id from cart
        cart.items.forEach(item => {
            axios({
                url: `http://localhost:5000/product/${item.product_id}`
            }).then(res => {
                const { product } = res.data;

                const {
                    name,
                    mrp,
                    sell_price,
                    thumbnail,
                    _id,
                    seller_id
                } = product;

                setCartProducts(allProducts =>
                    allProducts.concat({
                        name,
                        mrp,
                        sell_price,
                        thumbnail,
                        _id,
                        seller_id,
                        quantity: item.quantity
                    })
                );
            });
        });
        // using  the data from response populate the cartProducts array
    }, [cart]);

    // fetch total amount value
    useEffect(() => {
        const sell_prices = cartProducts.map(product =>
            parseInt(product.sell_price)
        );

        const prices = cartProducts.map(
            product => product.sell_price * product.quantity
        );

        const cartTotal = prices.reduce((a, b) => a + b, 0);

        if (sell_prices.length === cartProducts.length) {
            setTotalAmount(cartTotal);
        }
    }, [cartProducts]);

    // set Shipment and taxes charge
    useEffect(() => {
        if (totalAmount < 1000) {
            setShipmentCharge(200);
            setTaxes(15);
        } else if (totalAmount > 1000 && totalAmount < 3000) {
            setShipmentCharge(150);
            setTaxes(10);
        } else {
            setTaxes(5);
        }
    }, [totalAmount]);

    // calculate the tax
    useEffect(() => {
        let total = 0;

        if (taxes) {
            total = (taxes / 100) * totalAmount;
            setTaxAmount(total);
        }
    }, [taxes, totalAmount]);

    // calculate the final
    useEffect(() => {
        const paymentAmount = totalAmount + shipmentCharge + taxAmount;

        setPayAmount(paymentAmount);
    }, [taxAmount, totalAmount, shipmentCharge]);

    // fetch the cart products details

    // life cycle events
    useEffect(() => {
        axios({
            url: 'http://localhost:5000/member/memberInfo',
            withCredentials: true
        })
            .then(res => {
                const { isAuth, memberInfo } = res.data;

                if (isAuth) {
                    // const { addresses, contacts, paymentMethod } = memberInfo;
                    const { address, contact } = memberInfo;

                    setAddress(address);
                    setContact(contact);
                }
            })
            .catch(err => console.log(err));
    }, [cart]);

    // event handlers
    const BtnChangeAddress = () => {
        setToAddAddress(!toAddAddress);
    };

    const BtnAddContact = () => {
        setToAddContact(!toAddContact);
    };

    const NewAddressSubmit = event => {
        event.preventDefault();

        if (line_1 && city && state && pin) {
            axios({
                url: 'http://localhost:5000/member/memberAddress',
                method: 'PUT',
                data: {
                    line_1,
                    line_2,
                    line_3,
                    city,
                    state,
                    pin
                },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })
                .then(res => {
                    const { isAuth, memberInfo } = res.data;

                    if (isAuth) {
                        const { address } = memberInfo;

                        setAddress(address);
                    }
                })
                .catch(err => console.log(err));
        } else {
            alert('All fields required!');
        }
    };

    const NewContactSubmit = event => {
        event.preventDefault();

        if (contactNum) {
            if (contactNum.length === 10) {
                axios({
                    url: 'http://localhost:5000/member/memberContactNum',
                    method: 'PUT',
                    withCredentials: true,
                    data: {
                        contactNum
                    },
                    headers: { 'Content-Type': 'application/json' }
                }).then(res => {
                    const { isAuth, memberInfo } = res.data;

                    if (isAuth) {
                        const { contact } = memberInfo;

                        setContact(contact);
                    }
                });
            } else {
                alert('Length should be 10 digits.');
            }
        } else {
            alert('Contact Number required');
        }
    };

    // Place the order
    const HandlePlaceOrder = () => {
        if (paymentMethod === 'COD') {
            // check if address and contact number is provided
            if (address && contact) {
                // TODO: Send a request using axios on order controller and place the order.
                cartProducts.forEach(product => {
                    const {
                        _id: product_id,
                        seller_id,
                        quantity,
                        sell_price
                    } = product;

                    axios({
                        url: 'http://localhost:5000/order/place',
                        method: 'POST',
                        data: {
                            product_id,
                            seller_id,
                            quantity,
                            sell_price
                        },
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .then(res => {
                            const { isAuth } = res.data;

                            if (isAuth) {
                                const { order, orderExists } = res.data;

                                if (orderExists) {
                                    alert('Order Already Placed.');
                                } else if (order) {
                                    history.push('/profile');
                                }
                            }
                        })
                        .catch(err => console.log(err));
                });
            } else {
                alert('Address and contact number are required!');
            }
        } else {
            alert('Method invalid!');
        }
    };

    return (
        <div className="container">
            <h3 className="center">Check Out Page</h3>

            <div className="row">
                <div className="col s12 m6">
                    <h5 className="center">Address</h5>

                    {/* List of addresses with a delete button*/}
                    {address.length ? (
                        <div className="center">
                            {address.map(address => (
                                <div key={address._id} className="card-panel">
                                    <div>
                                        {address.line_1 && (
                                            <p>{address.line_1},</p>
                                        )}
                                        {address.line_2 && (
                                            <p>{address.line_2},</p>
                                        )}
                                        {address.line_3 && (
                                            <p>{address.line_3},</p>
                                        )}
                                        <p>{address.city},</p>
                                        <p>{address.state},</p>
                                        <p>{address.pin}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="center">
                            <p>No addresses found.</p>
                        </div>
                    )}

                    {/* Add new address form */}

                    <div className="center">
                        {toAddAddress ? (
                            <button
                                className="btn btn-flat white-text red darken-3"
                                onClick={BtnChangeAddress}
                            >
                                <i className="material-icons right">remove</i>
                                close
                            </button>
                        ) : (
                            <button
                                className="btn btn-flat white-text blue darken-3"
                                onClick={BtnChangeAddress}
                            >
                                <i className="material-icons right">edit</i>
                                Add or Change address
                            </button>
                        )}
                    </div>

                    {toAddAddress && (
                        <form autoComplete="off" onSubmit={NewAddressSubmit}>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="Address Line 1"
                                    value={line_1}
                                    onChange={e => setLine1(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="Address Line 2"
                                    value={line_2}
                                    onChange={e => setLine2(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="Address Line 3"
                                    value={line_3}
                                    onChange={e => setLine3(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={state}
                                    onChange={e => setState(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="text"
                                    placeholder="PIN"
                                    value={pin}
                                    onChange={e => setPin(e.target.value)}
                                />
                            </div>
                            <div className="center">
                                <button className="btn btn-flat white-text blue darken-3">
                                    <i className="material-icons right">add</i>
                                    Add address
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="col s12 m5 offset-m1">
                    <h5 className="center">Order Summary</h5>
                    <div className="card-panel center">
                        <p>Order Amount: Rs. {totalAmount}</p>
                        <p>Total Items: {totalItems}</p>
                        <p>Shipping &amp; Handling: Rs. {shipmentCharge}</p>
                        <p>Taxes: Rs. {taxAmount.toFixed(2)}</p>
                        <div className="pay-amount">
                            <p>Payable Amount: Rs. {payAmount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col s12 m6">
                    <h5 className="center">Contact Numbers</h5>

                    {contact.length ? (
                        <>
                            {contact.map(contact => (
                                <div key={contact._id} className="card-panel">
                                    <h6>{contact.number}</h6>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div>
                            <h6 className="center">
                                No contact numbers found.
                            </h6>
                        </div>
                    )}

                    <div className="center">
                        {toAddContact ? (
                            <button
                                className="btn btn-flat white-text red darken-3"
                                onClick={BtnAddContact}
                            >
                                <i className="material-icons right">remove</i>
                                close
                            </button>
                        ) : (
                            <button
                                className="btn btn-flat white-text blue darken-3"
                                onClick={BtnAddContact}
                            >
                                <i className="material-icons right">edit</i>
                                Add or change Number
                            </button>
                        )}

                        {toAddContact && (
                            <form
                                autoComplete="off"
                                onSubmit={NewContactSubmit}
                            >
                                <div className="input-field">
                                    <input
                                        type="text"
                                        placeholder="Contact Number"
                                        value={contactNum}
                                        onChange={e =>
                                            setContactNum(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="center">
                                    <button className="btn btn-flat white-text blue darken-3">
                                        <i className="material-icons right">
                                            add
                                        </i>
                                        Add Contact Number
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
                <div className="col s12 m5 offset-m1">
                    <h5 className="center">Cart preview</h5>
                    <div className="card-panel">
                        {cartProducts.map(product => (
                            <div className="card-panel" key={product._id}>
                                <div className="cart-preview left">
                                    <span>
                                        <img
                                            src={`/uploads/${product.seller_id}/${product._id}/${product.thumbnail}`}
                                            alt="thumbnail"
                                            style={{
                                                maxWidth: '50px',
                                                marginTop: '10px',
                                                marginRight: '20px'
                                            }}
                                        />
                                    </span>
                                    <span>
                                        <p>{product.name}</p>
                                    </span>
                                </div>
                                <div className="cart-preview">
                                    <p className="left">
                                        Rs.{product.sell_price}
                                    </p>
                                    <p className="right">
                                        qty: {product.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col s12 m6">
                    <h5 className="center">Payment Method</h5>
                    <select
                        name="paymentMethods"
                        defaultValue={'DebitCard'}
                        onChange={e => setPaymentMethod(e.target.value)}
                    >
                        <option value="DebitCard">Debit Cart</option>
                        <option value="CreditCard">Credit Cart</option>
                        <option value="COD">Cash On Delivery</option>
                    </select>
                </div>
            </div>

            <div className="row mt-5">
                <div className="buttons">
                    <button className="btn btn-flat white-text waves-effect waves-dark blue darken-3">
                        <i className="material-icons right">edit</i>
                        Edit Cart Items
                    </button>

                    <button
                        className="btn btn-flat white-text waves-effect waves-dark blue"
                        onClick={HandlePlaceOrder}
                    >
                        <i className="material-icons right">check</i>
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
