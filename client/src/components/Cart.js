// hooks
import { useEffect, useState, useContext, useCallback } from 'react';

// axios
import axios from 'axios';

// react-router-dom
import { useLocation, useHistory } from 'react-router-dom';

// context
import { AppContext } from '../contexts/AppContext';

const Cart = () => {
    // context
    const { dispatchCart } = useContext(AppContext);

    // state
    const [cartProducts, setCartProducts] = useState([]);

    // location
    const location = useLocation();

    // history
    const history = useHistory();

    /*
     * Function to fetch products details
     */
    const FetchProductsDetails = useCallback(
        products => {
            products.forEach(product => {
                axios({
                    url: `http://localhost:5000/product/${product.product_id}`
                })
                    .then(res => {
                        const {
                            name,
                            mrp,
                            sell_price,
                            thumbnail,
                            seller_id,
                            manufacturer
                        } = res.data.product;

                        const appendProduct = {
                            name,
                            mrp,
                            sell_price,
                            thumbnail,
                            product_id: product.product_id,
                            seller_id,
                            manufacturer,
                            quantity: product.quantity
                        };

                        setCartProducts(prevProducts =>
                            prevProducts.concat(appendProduct)
                        );
                    })
                    .catch(err => console.log(err));
            });
        },
        //eslint-disable-next-line
        []
    );

    /* useEffect hook as componentDidMount:
     * Requests cart items for the first render display. 
    ------------------------------------------------------------*/

    useEffect(() => {
        // fetch items from the cart if directly accessed
        axios({
            url: 'http://localhost:5000/cart/getItems',
            withCredentials: true
        })
            .then(res => {
                const { products } = res.data;

                if (products.length) {
                    // loop through the products array and fetch the necessary product details using axios
                    FetchProductsDetails(products);
                }
            })
            .catch(err => console.log(err));
    }, [FetchProductsDetails]);

    /*
     * Dispatch action to update cart reducer
     */

    useEffect(() => {
        const items = cartProducts.map(product => {
            return {
                product_id: product.product_id,
                seller_id: product.seller_id,
                quantity: product.quantity
            };
        });

        dispatchCart({ type: 'SET_ITEMS', payload: { items } });
    }, [cartProducts, dispatchCart]);

    /* Function to add or subtract quantity of items in the cart
    ------------------------------------------------------*/

    const ChangeQty = (product_id, opr) => {
        let quantity = cartProducts.find(
            product => product.product_id === product_id
        ).quantity;

        switch (opr) {
            case '+':
                quantity += 1;
                break;

            case '-':
                quantity -= 1;
                break;

            default:
                quantity = 0;
        }

        if (quantity > 0) {
            axios({
                url: 'http://localhost:5000/cart/update',
                data: {
                    product_id,
                    quantity
                },
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            }).then(res => {
                // fetch the new quantity of the product using the product_id
                const newQty = res.data.cart.products.find(
                    product => product.product_id === product_id
                ).quantity;

                const index = cartProducts.findIndex(
                    product => product.product_id === product_id
                );

                cartProducts[index].quantity = newQty;

                setCartProducts([...cartProducts]);
            });
        } else {
            alert('Minimum quantity has to be 1 unit.');
        }
    };

    /*
     * Remove an item from the cart
     */
    const RemoveItem = product_id => {
        axios({
            url: 'http://localhost:5000/cart/remove',
            method: 'DELETE',
            data: {
                product_id
            },
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        }).then(() => {
            // filter out the product with the matching product id
            const remainingProducts = cartProducts.filter(
                product => product.product_id !== product_id
            );

            setCartProducts(remainingProducts);

            dispatchCart({
                type: 'SET_ITEMS',
                payload: { items: remainingProducts }
            });
        });
    };

    /*
     * Remove all the items from the cart
     */
    const ClearCart = () => {
        axios({
            url: 'http://localhost:5000/cart/empty',
            method: 'DELETE',
            withCredentials: true
        })
            .then(() => {
                setCartProducts([]);

                dispatchCart({ type: 'RESET_ITEMS' });
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        if (location.state && location.state.from === 'loginPage') {
            const { product_id, seller_id } = location.state;

            if (product_id && seller_id) {
                // add product to the cart
                axios({
                    url: 'http://localhost:5000/cart/add',
                    method: 'POST',
                    data: {
                        product_id,
                        seller_id
                    },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                })
                    .then(res => {
                        const { itemExists } = res.data;

                        if (itemExists) {
                            alert('Item already in cart');
                        } else {
                            const { products } = res.data.cart;

                            FetchProductsDetails(products);
                        }
                    })
                    .catch(err => console.log(err));
            }
        }
    }, [location.state, FetchProductsDetails, history]);

    useEffect(() => {
        // reset location state property
        history.push({
            state: {}
        });
    }, [history]);

    // Redirect To CheckOut Page
    const RedirectCheckOut = () => {
        history.push('/checkout');
    };

    // Redirect to Products listing page
    const ProductsRedirect = () => {
        history.push('/');
    };

    return cartProducts.length ? (
        <div className="container">
            <h3 className="center">My Shopping Cart</h3>
            <div className="mt-5">
                <table className="striped centered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Company</th>
                            <th>Amount</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartProducts.map(product => (
                            <tr key={product.product_id}>
                                <td>
                                    <span>
                                        <img
                                            src={`/uploads/${product.seller_id}/${product.product_id}/${product.thumbnail}`}
                                            alt="thumbnail"
                                            style={{
                                                maxWidth: '50px'
                                            }}
                                        />
                                    </span>
                                    <span>{product.name}</span>
                                </td>
                                <td>{product.manufacturer}</td>
                                <td>Rs. {product.sell_price}</td>
                                <td className="qty">
                                    <button
                                        className="btn btn-flat white-text blue darken-2"
                                        onClick={() =>
                                            ChangeQty(product.product_id, '+')
                                        }
                                    >
                                        <i className="material-icons">add</i>
                                    </button>
                                    <span>{product.quantity}</span>
                                    <button
                                        className="btn btn-flat white-text blue darken-2"
                                        onClick={() =>
                                            ChangeQty(product.product_id, '-')
                                        }
                                    >
                                        <i className="material-icons">remove</i>
                                    </button>
                                </td>
                                <td>
                                    Rs. {product.sell_price * product.quantity}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-floating red darken-3"
                                        onClick={() =>
                                            RemoveItem(product.product_id)
                                        }
                                    >
                                        <i className="material-icons">delete</i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="center mt-5">
                    <button
                        className="btn btn-flat white-text waves-effect waves-dark blue darken-3"
                        onClick={RedirectCheckOut}
                    >
                        Check Out
                    </button>

                    <button
                        className="btn btn-flat white-text waves-effect waves-dark red darken-4"
                        onClick={ClearCart}
                    >
                        <i className="material-icons right">delete</i>
                        clear cart
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <div className="container">
            <h5 className="center mt-5">
                No items in cart. Continue shopping...
                <div className="row center">
                    <button
                        className="btn btn-flat white-text waves-effect waves-dark blue darken-4 mt-3"
                        onClick={ProductsRedirect}
                    >
                        <i className="material-icons left">arrow_back</i>
                        Products Page
                    </button>
                </div>
            </h5>
        </div>
    );
};

export default Cart;
