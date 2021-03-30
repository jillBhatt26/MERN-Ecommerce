// hooks
import { useState, useEffect } from 'react';

// react-router-dom
import { Link } from 'react-router-dom';

// axios
import axios from 'axios';

const Profile = () => {
    const [isSeller, setIsSeller] = useState(false);
    const [orders, setOrders] = useState([]);

    // componentDidMount for fetching seller info
    useEffect(() => {
        fetch('http://localhost:5000/member/seller/getSellerInfo', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setIsSeller(data.isSeller);
            });
    }, []);

    // componentDidMount for fetching Orders placed by the member
    useEffect(() => {
        axios({
            url: 'http://localhost:5000/order/member/fetchAll',
            withCredentials: true
        })
            .then(res => {
                // console.log(res.data);
                // fetch the product details from the product_id

                const { orders } = res.data;

                if (orders.length) {
                    orders.forEach(order => {
                        const { product_id } = order;

                        axios({
                            url: `http://localhost:5000/product/${product_id}`
                        })
                            .then(res => {
                                const { product } = res.data;

                                const amount =
                                    product.sell_price * order.quantity;

                                // set the order using product details and order details

                                const orderDetails = {
                                    order_id: order._id,
                                    name: product.name,
                                    manufacturer: product.manufacturer,
                                    quantity: order.quantity,
                                    status: order.status,
                                    amount
                                };

                                // set the orders
                                setOrders(allOrders =>
                                    allOrders.concat(orderDetails)
                                );
                            })
                            .catch(err => console.log(err));
                    });
                }
            })
            .catch(err => console.log(err));
    }, []);

    // event handlers

    // TODO: Add quantity and order status in order for the controller to validate the cancel request and restore the quantity.
    const HandleCancelOrder = (order_id, quantity, status) => {
        axios({
            url: 'http://localhost:5000/order/cancel',
            method: 'DELETE',
            data: {
                order_id,
                quantity,
                status
            },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }).then(() => {
            // filter out the order from the orders array and set the orders array
            const remainingOrders = orders.filter(
                order => order.order_id !== order_id
            );

            setOrders(remainingOrders);
        });
    };

    return (
        <div>
            <h3 className="center">Orders</h3>

            {/* render all the orders placed */}
            {orders.length ? (
                <div className="container center">
                    <table className="striped centered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Manufacturer</th>
                                <th>Quantity</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.order_id}>
                                    <td>{order.name}</td>
                                    <td>{order.manufacturer}</td>
                                    <td>{order.quantity}</td>
                                    <td>{order.amount}</td>
                                    <td>{order.status}</td>
                                    <td>
                                        {order.status === 'placed' && (
                                            <button
                                                className="btn btn-floating red darken-3"
                                                onClick={() =>
                                                    HandleCancelOrder(
                                                        order.order_id,
                                                        order.quantity,
                                                        order.status
                                                    )
                                                }
                                            >
                                                <i className="material-icons">
                                                    delete
                                                </i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="center">
                    <h5>No orders placed.</h5>
                </div>
            )}

            {/* seller sign up option */}
            {isSeller ? (
                <p className="center">You already are a seller </p>
            ) : (
                <p className="center mt-5">
                    Sign Up as a seller <Link to="/sellerSignup">here</Link>
                </p>
            )}
        </div>
    );
};

export default Profile;
