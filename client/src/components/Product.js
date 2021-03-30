// hooks
import { useContext, useEffect, useState } from 'react';

// react-router-dom
import { Link, useHistory } from 'react-router-dom';

// context
import { AppContext } from '../contexts/AppContext';

// axios
import axios from 'axios';

const Product = ({ product }) => {
    // context
    const { cart, member, dispatchCart } = useContext(AppContext);

    // state
    const [isItemAdded, setIsItemAdded] = useState(false);

    // useHistory hook
    const history = useHistory();

    // state manipulation
    useEffect(() => {
        if (member.isAuth) {
            if (cart.items.length) {
                const itemInCart = cart.items.find(
                    item => item.product_id === product._id
                );

                if (itemInCart) {
                    setIsItemAdded(true);
                }
            } else {
                setIsItemAdded(false);
            }
        } else {
            setIsItemAdded(false);
        }
    }, [cart, product._id, member.isAuth]);

    // event handlers
    const AddToCart = (product_id, seller_id) => {
        if (member.isAuth) {
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
                    const { products } = res.data.cart;

                    dispatchCart({
                        type: 'SET_ITEMS',
                        payload: { items: products }
                    });
                })
                .catch(err => console.log(err));
        } else {
            // redirect to login page with a state
            history.push({
                pathname: '/login',
                state: {
                    from: 'product',
                    product_id,
                    seller_id
                }
            });
        }
    };

    return (
        <div className="col s12 m6 l4">
            <div className="card black-text">
                <Link to={`/product/${product._id}`}>
                    <div className="card-image">
                        <img
                            src={`uploads/${product.seller_id}/${product._id}/thumbnail.jpg`}
                            alt="product thumbnail"
                        />

                        <span className="card-title">{product.name}</span>

                        {/* <button className="btn-floating btn-large halfway-fab waves-effect waves-light red darken-2 white-text">
                            <i className="material-icons">bookmark_border</i>
                        </button> */}
                    </div>

                    <div className="card-content">
                        <p style={{ marginBottom: '10px' }}>
                            {product.manufacturer}
                        </p>
                        <p className="product-price">
                            <span style={{ fontWeight: 'bold' }}>
                                Rs: {product.sell_price}
                            </span>
                            <span>
                                <s style={{ color: '#aaa' }}>
                                    Rs. {product.mrp}
                                </s>
                            </span>
                            <span>
                                {(
                                    100 -
                                    (product.sell_price / product.mrp) * 100
                                ).toFixed(1)}
                                % off
                            </span>
                        </p>
                    </div>
                </Link>
                <div className="card-action">
                    <div className="row">
                        {isItemAdded ? (
                            <button
                                className="btn btn-flat waves-effect waves-dark blue darken-3 white-text col s12"
                                disabled
                            >
                                <i className="material-icons right">check</i>
                                In Cart
                            </button>
                        ) : (
                            <button
                                className="btn btn-flat waves-effect waves-dark blue darken-3 white-text col s12"
                                onClick={() =>
                                    AddToCart(product._id, product.seller_id)
                                }
                            >
                                <i className="material-icons right">
                                    add_shopping_cart
                                </i>
                                Add To Cart
                            </button>
                        )}

                        {/* <button className="btn btn-flat waves-effect waves-dark teal darken-3 white-text col s12 mt-1">
                            <i className="material-icons right">
                                account_balance_wallet
                            </i>
                            Buy Now
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;
