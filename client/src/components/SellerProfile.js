// hooks
import { useEffect, useState, useContext } from 'react';

// react-modal
import Modal from 'react-modal';

// components
import AddProduct from './AddProduct';

// context imports
import { AppContext } from '../contexts/AppContext';

// axios
import axios from 'axios';

// modal root element setup
Modal.setAppElement('#root');

const SellerProfile = () => {
    // state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [editProductSellPrice, setEditProductSellPrice] = useState('');
    const [editProductQuantity, setEditProductQuantity] = useState('');

    // context
    const { products } = useContext(AppContext);

    useEffect(() => {
        const M = window.M;
        M.AutoInit();
    }, []);

    // useEffect to list products sold by seller
    useEffect(() => {
        fetch('http://localhost:5000/product/sellerProducts', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                const { products, errMsg } = data;

                if (errMsg) {
                    alert(errMsg);
                } else {
                    if (products.length) {
                        setSellerProducts(products);
                    }
                }
            })
            .catch(err => console.log(err));
    }, []);

    // useEffect (componentDidMount) to fetch all the orders received by the seller
    useEffect(() => {
        axios({
            url: 'http://localhost:5000/order/seller/fetchAll',
            withCredentials: true
        })
            .then(res => {
                const { orders, isAuth } = res.data;
                //TODO: set the seller orders array

                if (isAuth) {
                    orders.forEach(order => {
                        // NOTE: Ensure that sellerProducts array is populated
                        if (sellerProducts.length) {
                            // look for product sold by the seller
                            const orderedProduct = sellerProducts.find(
                                product => product._id === order.product_id
                            );

                            // fetch the ordered product details
                            const orderDetails = {
                                order_id: order._id,
                                thumbnail: orderedProduct.thumbnail,
                                seller_id: orderedProduct.seller_id,
                                product_id: orderedProduct._id,
                                name: orderedProduct.name,
                                manufacturer: orderedProduct.manufacturer,
                                quantity: order.quantity,
                                sell_price: order.sell_price,
                                status: order.status,
                                username: order.username,
                                email: order.email
                            };

                            // append the product
                            setSellerOrders(allOrders =>
                                allOrders.concat(orderDetails)
                            );
                        }
                    });
                }
            })
            .catch(err => console.log(err));
        // eslint-disable-next-line
    }, [sellerProducts]);

    // update sellerProducts useEffect
    useEffect(() => {
        setSellerProducts(products);
    }, [products]);

    // event handlers
    const HandleStatusChange = (status, order_id) => {
        // send the request to update the status of the order
        axios({
            url: 'http://localhost:5000/order/seller/update',
            method: 'put',
            data: {
                status,
                order_id
            },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }).catch(err => console.log(err));
    };

    // Handle Edit Mode
    const HandleEditMode = product_id => {
        setEditMode(!editMode);
        setEditProductId(product_id);
    };

    // Handle Edit Product Details
    const HandleEditProductDetails = product_id => {
        // send a request to edit the product details specified
        axios({
            url: `http://localhost:5000/product/update/${product_id}`,
            method: 'PUT',
            withCredentials: true,
            data: {
                sell_price: editProductSellPrice,
                quantity: editProductQuantity
            },
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => {
                // edit the product details in the sellerProducts array in the state
                const index = sellerProducts.findIndex(
                    product => product._id === product_id
                );

                // edit the product details at the particular index
                const toEditProduct = sellerProducts[index];

                // if details are not available keep the original
                toEditProduct.sell_price =
                    editProductSellPrice || toEditProduct.sell_price;
                toEditProduct.quantity =
                    editProductQuantity || toEditProduct.quantity;

                // reset the seller orders
                setSellerOrders([]);

                // set the array with the product edited
                setSellerProducts([...sellerProducts]);

                // turn off the edit mode
                setEditMode(false);
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="container">
            <h3 className="center mt-5">Received Orders</h3>

            {/* Display all the orders received by the seller*/}
            {sellerOrders.length ? (
                <table className="striped centered">
                    <thead>
                        <tr>
                            <th>Thumbnail</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Manufacturer</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellerOrders.map(order => (
                            <tr key={order.order_id}>
                                <td>
                                    <img
                                        src={`/uploads/${order.seller_id}/${order.product_id}/${order.thumbnail}`}
                                        alt="product thumbnail"
                                        style={{ maxWidth: '100px' }}
                                    />
                                </td>
                                <td>{order.name}</td>
                                <td>{order.username}</td>
                                <td>{order.email}</td>
                                <td>{order.manufacturer}</td>
                                <td>{order.sell_price}</td>
                                <td>{order.quantity}</td>

                                <td>
                                    <select
                                        name="order_status"
                                        defaultValue={'status'}
                                        className="browser-default"
                                        onChange={e =>
                                            HandleStatusChange(
                                                e.target.value,
                                                order.order_id
                                            )
                                        }
                                    >
                                        <option
                                            value={
                                                order.status === 'placed'
                                                    ? 'status'
                                                    : 'placed'
                                            }
                                        >
                                            Placed
                                        </option>
                                        <option
                                            value={
                                                order.status === 'received'
                                                    ? 'status'
                                                    : 'received'
                                            }
                                        >
                                            Received
                                        </option>
                                        <option
                                            value={
                                                order.status === 'dispatched'
                                                    ? 'status'
                                                    : 'dispatched'
                                            }
                                        >
                                            Dispatched
                                        </option>
                                        <option
                                            value={
                                                order.status === 'reached city'
                                                    ? 'status'
                                                    : 'reached city'
                                            }
                                        >
                                            Reached city
                                        </option>
                                        <option
                                            value={
                                                order.status ===
                                                'out for delivery'
                                                    ? 'status'
                                                    : 'out for delivery'
                                            }
                                        >
                                            Out for delivery
                                        </option>
                                        <option
                                            value={
                                                order.status === 'delivered'
                                                    ? 'status'
                                                    : 'delivered'
                                            }
                                        >
                                            Delivered
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="center">
                    <h5>No Orders Received.</h5>
                </div>
            )}

            <h3 className="center mt-5">Products On Sale</h3>

            {sellerProducts.length > 0 ? (
                <>
                    {/* Products table goes here */}
                    <table className="centered striped">
                        <thead>
                            <tr>
                                <th>thumbnail</th>
                                <th>Name</th>
                                <th>Manufacturer</th>
                                <th>Price</th>
                                <th>Quantity Remaining</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellerProducts.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <img
                                            src={`/uploads/${product.seller_id}/${product._id}/${product.thumbnail}`}
                                            alt="product thumbnail"
                                            style={{ maxWidth: '100px' }}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.manufacturer}</td>
                                    <td>
                                        {editMode &&
                                        editProductId === product._id ? (
                                            <input
                                                type="number"
                                                min="1"
                                                defaultValue={
                                                    product.sell_price
                                                }
                                                onChange={e =>
                                                    setEditProductSellPrice(
                                                        e.target.value
                                                    )
                                                }
                                                style={{
                                                    maxWidth: '100px',
                                                    textAlign: 'center'
                                                }}
                                            />
                                        ) : (
                                            product.sell_price
                                        )}
                                    </td>
                                    <td>
                                        {editMode &&
                                        editProductId === product._id ? (
                                            <input
                                                type="number"
                                                min="1"
                                                defaultValue={product.quantity}
                                                style={{
                                                    maxWidth: '100px',
                                                    textAlign: 'center'
                                                }}
                                                onChange={e =>
                                                    setEditProductQuantity(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            product.quantity
                                        )}
                                    </td>
                                    <td>
                                        <button className="btn btn-flat white-text red darken-3">
                                            <i className="material-icons">
                                                delete
                                            </i>
                                        </button>
                                        {editMode &&
                                        editProductId === product._id ? (
                                            <button
                                                className="btn btn-flat white-text blue"
                                                onClick={() =>
                                                    HandleEditProductDetails(
                                                        product._id
                                                    )
                                                }
                                            >
                                                <i className="material-icons">
                                                    check
                                                </i>
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-flat white-text blue"
                                                onClick={() =>
                                                    HandleEditMode(product._id)
                                                }
                                            >
                                                <i className="material-icons">
                                                    edit
                                                </i>
                                            </button>
                                        )}
                                        {editMode &&
                                            editProductId === product._id && (
                                                <button
                                                    className="btn btn-flat white-text red darken-3"
                                                    onClick={() =>
                                                        setEditMode(false)
                                                    }
                                                >
                                                    <i className="material-icons">
                                                        cancel
                                                    </i>
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <h6 className="center">No products on sale by the seller.</h6>
            )}

            {/* Add New Product Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                shouldCloseOnEsc={true}
                className="Modal"
                overlayClassName="Overlay"
            >
                <AddProduct setIsModalOpen={setIsModalOpen} />
            </Modal>

            <div className="center mt-5">
                <button
                    className="btn-flat white-text blue darken-3"
                    onClick={() => setIsModalOpen(true)}
                >
                    <i className="material-icons right">add</i>
                    Add Product
                </button>
            </div>
        </div>
    );
};

export default SellerProfile;
