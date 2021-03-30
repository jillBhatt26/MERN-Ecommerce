// hooks
// import { useContext, useEffect, useCallback, useState } from 'react';
import { useEffect, useState, useContext } from 'react';

// axios
import axios from 'axios';

// import product
import Product from './Product';

import { useLocation } from 'react-router-dom';

// context import
import { AppContext } from '../contexts/AppContext';

const Products = () => {
    // context
    const { dispatchCart } = useContext(AppContext);

    // state
    const [products, setProducts] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [sortBy, setSortBy] = useState(null);
    const [searchProduct, setSearchProduct] = useState('');

    // location
    const location = useLocation();

    // function to make request and fetch all the products
    const FetchProductsAll = () => {
        axios
            .get('http://localhost:5000/product/all')
            .then(res => {
                setProducts(res.data.products);
            })
            .catch(err => console.log(err));
    };

    // componentDidMount to fetch the products on initial render.
    useEffect(() => {
        if (location.state && location.state.from === 'loginPage') {
            // fetch the product_id and seller_id from location state

            console.log(location.state);

            const { product_id, seller_id } = location.state;

            if ((product_id, seller_id)) {
                // add the product to the cart and then fetch all the products
                axios({
                    url: 'http://localhost:5000/cart/add',
                    method: 'POST',
                    data: {
                        product_id,
                        seller_id
                    },
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }).then(res => {
                    const { itemExists } = res.data;

                    if (itemExists) {
                        FetchProductsAll();
                    } else {
                        const { products } = res.data.cart;
                        dispatchCart({
                            type: 'SET_ITEMS',
                            payload: { items: products }
                        });
                    }
                });
            } else {
                console.log('product_id: ', product_id);
                console.log('seller_id: ', seller_id);
            }
        } else {
            FetchProductsAll();
            return () => setProducts([]);
        }
    }, [location.state, dispatchCart]);

    // sort the array according to the option selected
    useEffect(() => {
        let sortedProducts = [];

        switch (sortBy) {
            case 'ascPrice':
                sortedProducts = products.sort((a, b) =>
                    parseInt(a.sell_price) > parseInt(b.sell_price) ? 1 : -1
                );
                break;

            case 'descPrice':
                sortedProducts = products.sort((a, b) =>
                    parseInt(a.sell_price) < parseInt(b.sell_price) ? 1 : -1
                );

                break;

            // calculate the discount percentage and then sort the array
            case 'ascDiscount':
                sortedProducts = products.sort((a, b) =>
                    100 - (parseInt(a.sell_price) / parseInt(a.mrp)) * 100 >
                    100 - (parseInt(b.sell_price) / parseInt(b.mrp)) * 100
                        ? 1
                        : -1
                );
                break;

            // calculate the discount percentage and then sort the array
            case 'descDiscount':
                sortedProducts = products.sort((a, b) =>
                    100 - (parseInt(a.sell_price) / parseInt(a.mrp)) * 100 <
                    100 - (parseInt(b.sell_price) / parseInt(b.mrp)) * 100
                        ? 1
                        : -1
                );
                break;

            default:
                sortedProducts = [];
        }

        setProducts([]);

        sortedProducts.forEach(sortedProduct => {
            setProducts(allProducts => allProducts.concat(sortedProduct));
        });
        // eslint-disable-next-line
    }, [sortBy]);

    // create a new render list whenever a change is detected in products
    useEffect(() => {
        if (products.length) {
            // product list to render
            const renderProducts = products.map(product => (
                <Product product={product} key={product._id} />
            ));

            setProductsList(renderProducts);
        }
    }, [products]);

    // event handlers
    const HandleSearchProducts = event => {
        event.preventDefault();

        if (searchProduct) {
            const searchURL = `http://localhost:5000/product/search?q=${searchProduct}`;

            axios({
                url: searchURL
            })
                .then(res => {
                    const { matches } = res.data;

                    setProducts(matches);
                })
                .catch(err => console.log(err));
        } else {
            alert('Please describe the product you are looking for.');
        }
    };

    return products.length ? (
        <div className="container">
            <h4 className="center">Browse Products</h4>

            <div className="row">
                <div className="col s12 m8">
                    {/* Search products form */}
                    <form onSubmit={HandleSearchProducts}>
                        <div className="input-field col s12 m8 ">
                            <input
                                type="text"
                                placeholder="Search Products"
                                value={searchProduct}
                                onChange={e => setSearchProduct(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-flat white-text blue darken-3 waves-effect waves-dark col s12 m3"
                            style={{ marginTop: '20px' }}
                        >
                            <i className="material-icons right">search</i>
                            search
                        </button>
                    </form>
                </div>
                <div className="col s12 m4 offset-m-2">
                    {/* Select element to sort products */}
                    <select
                        name="sort"
                        defaultValue={'DEFAULT'}
                        className="browser-default"
                        style={{ marginTop: '18px' }}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="DEFAULT" disabled>
                            Sort
                        </option>
                        <option value="ascPrice">PRICE - Low to High</option>
                        <option value="descPrice">PRICE - High to Low</option>
                        <option value="ascDiscount">
                            DISCOUNT - Low to High
                        </option>
                        <option value="descDiscount">
                            DISCOUNT - High to Low
                        </option>
                    </select>
                </div>
            </div>

            <div className="row">{productsList}</div>
        </div>
    ) : (
        <div>
            {!searchProduct && <h4 className="center">No Products On Sale.</h4>}
            {searchProduct && (
                <div className="center">
                    <h4>No products found</h4>
                    <button
                        className="btn btn-flat waves-effect waves-dark white-text blue darken-3 mt-3"
                        onClick={() => {
                            FetchProductsAll();
                            setSearchProduct('');
                        }}
                    >
                        All Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default Products;
