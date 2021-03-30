// hooks
import { useEffect, useState, useContext } from 'react';

// react-router-dom
import { useParams, useHistory } from 'react-router-dom';

// axios
import axios from 'axios';

// components
import Slider from './Slider';

// context
import { AppContext } from '../contexts/AppContext';

const ProductDetail = () => {
    // state
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [isOrdered, setIsOrdered] = useState(false);
    const [rating, setRating] = useState(null);
    const [reviewText, setReviewText] = useState('');

    // react-router-dom
    const { id } = useParams();
    const history = useHistory();

    // context
    const { member, dispatchCart } = useContext(AppContext);

    useEffect(() => {
        // fetch the product details using the product_id variable
        axios
            .get(`http://localhost:5000/product/${id}`)
            .then(res => {
                setProduct(res.data.product);
            })
            .catch(err => console.log(err));

        // fetch the product reviews using id
        axios
            .get(`http://localhost:5000/product/reviews/${id}`)
            .then(res => {
                const { reviews, errMsg } = res.data;

                if (errMsg) {
                    alert(errMsg);
                } else if (reviews) {
                    setReviews(reviews);
                }
            })
            .catch(err => console.log(err));

        // check if the logged in member has ordered the product
        if (member.isAuth) {
            axios({
                url: 'http://localhost:5000/order/member/fetchAll',
                withCredentials: true
            })
                .then(res => {
                    let hasOrdered = null;

                    const { orders } = res.data;

                    hasOrdered = orders.find(order => order.product_id === id);

                    if (hasOrdered && hasOrdered.status === 'received') {
                        setIsOrdered(true);
                    }
                })
                .catch(err => console.log(err));
            // if the product has been ordered by the member,
            // display the rating component
        }

        return () => setIsOrdered(false);
    }, [id, member.isAuth]);

    useEffect(() => {
        if (product) {
            const imgArr = product.images.map(img => img.imageName);

            const productImages = [product.thumbnail, ...imgArr];

            setImages(productImages);

            const discount = 100 - (product.sell_price / product.mrp) * 100;

            setDiscount(discount);
        }
    }, [product]);

    // TODO: Check if the product is already ordered.
    // useEffect(() => {}, []);

    // render the reviews
    const reviewsList = reviews.map(review => (
        <div className="card-panel col s12 m5 offset-m1" key={review._id}>
            <p>Rating: {review.rating}</p>
            <p>Review: {review.review}</p>
        </div>
    ));

    const AddToCartHandler = async () => {
        const formData = new FormData();

        formData.append('product_id', product._id);
        formData.append('seller_id', product.seller_id);

        try {
            const res = await axios.post(
                'http://localhost:5000/cart/add',
                formData,
                {
                    withCredentials: true
                }
            );

            const { isAuth, itemExists } = res.data;

            if (isAuth) {
                if (itemExists) {
                    alert('Item already exists.');
                } else {
                    // dispatch action to add product to cart and state

                    dispatchCart({
                        type: 'SET_ITEMS',
                        payload: { items: res.data.cart.products }
                    });

                    // display the alert message
                    alert('New item added to cart.');
                }
            } else {
                history.push({
                    pathname: '/login',
                    state: {
                        from: 'productDetail',
                        product_id: product._id,
                        seller_id: product.seller_id
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const HandleAddReview = event => {
        event.preventDefault();

        if (rating) {
            axios({
                url: 'http://localhost:5000/product/review',
                method: 'POST',
                withCredentials: true,
                data: {
                    product_id: id,
                    rating,
                    review: reviewText
                },
                headers: { 'Content-Type': 'application/json' }
            }).then(res => {
                console.log(res.data);

                const { review } = res.data;

                if (review) {
                    setReviews([...reviews, review]);
                }
            });
        } else {
            alert('Please provide a rating for the product.');
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col s12 m7">
                    <Slider images={images} product={product} />
                </div>
                <div className="col s12 m3 offset-m2">
                    <h3>{product && product.name}</h3>

                    <h6 className="mb-2">
                        by, {product && product.manufacturer}
                    </h6>

                    <div className="price-info">
                        <span>
                            <s>Rs. {product && product.mrp}</s>
                        </span>

                        <span>Rs. {product && product.sell_price}</span>

                        <span>{product && discount.toFixed(1)} % off</span>
                    </div>

                    <h6>{product && product.category}</h6>

                    <p>{product && product.description}</p>

                    <div className="row">
                        <button
                            className="col s12 mr-1 btn btn-flat white-text blue darken-3 waves-effect waves-dark"
                            onClick={AddToCartHandler}
                        >
                            <i className="material-icons right">
                                add_shopping_cart
                            </i>
                            Add to cart
                        </button>

                        {/* <button className="col s12 ml-1 mt-1 btn btn-flat white-text teal darken-3 waves-effect waves-dark">
                            <i className="material-icons right">
                                account_balance_wallet
                            </i>
                            Buy Now
                        </button> */}
                    </div>
                </div>
            </div>

            {/* List all the product reviews */}
            <h4 className="center">Product Reviews</h4>
            <div>
                {reviews.length ? (
                    reviewsList
                ) : (
                    <h5 className="center">This product has no reviews.</h5>
                )}
            </div>

            {/* NOTE: Display the div only if the user has purchased the product */}
            {isOrdered && (
                <div className="row center mt-5">
                    <div className="col s12 m6 offset-m3">
                        <h5 className="mb-3">Rate the product</h5>

                        <div className="row">
                            <form onSubmit={HandleAddReview} autoComplete="off">
                                <select
                                    name="rating"
                                    defaultValue={'DEFAULT'}
                                    className="browser-default"
                                    onChange={e => setRating(e.target.value)}
                                >
                                    <option value="DEFAULT" disabled>
                                        Rating
                                    </option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>

                                <div className="input-field">
                                    <textarea
                                        placeholder="Product Review"
                                        className="materialize-textarea"
                                        value={reviewText}
                                        onChange={e =>
                                            setReviewText(e.target.value)
                                        }
                                    ></textarea>
                                </div>

                                <button className="btn btn-flat blue darken-3 white-text waves-effect waves-dark">
                                    Add Review
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
