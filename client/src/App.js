import { useEffect, useContext } from 'react';

// react-router-dom
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';

// context
import { AppContext } from './contexts/AppContext';

// axios
import axios from 'axios';

// components
import Navbar from './components/Navbar';
import SignUp from './components/SignUp';
import Login from './components/Login';
import SellerSignUp from './components/SellerSignUp';
import Products from './components/Products';
import Footer from './components/Footer';
import Profile from './components/Profile';
import SellerProfile from './components/SellerProfile';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

const App = () => {
    const { member, dispatchMember, dispatchCart } = useContext(AppContext);

    useEffect(() => {
        fetch('http://localhost:5000/member/loggedin', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                const { member_id, username } = data.member;
                const { isSeller } = data;

                dispatchMember({
                    type: 'LOGIN',
                    payload: { member_id, username, isSeller }
                });
            })
            .catch(() => {
                dispatchMember({ type: 'LOGOUT' });
            });
    }, [dispatchMember]);

    useEffect(() => {
        if (member.isAuth) {
            axios({
                url: 'http://localhost:5000/cart/getItems',
                withCredentials: true
            }).then(res => {
                if (res.data.products) {
                    dispatchCart({
                        type: 'SET_ITEMS',
                        payload: { items: res.data.products }
                    });
                }
            });
        } else {
            dispatchCart({ type: 'RESET_ITEMS' });
        }
    }, [member.isAuth, dispatchCart]);

    return (
        <>
            <Router>
                <Navbar />

                <Switch>
                    <Route exact path="/">
                        <Products />
                    </Route>

                    <Route exact path="/signup">
                        {member.isAuth ? <Redirect to="/" /> : <SignUp />}
                    </Route>

                    <Route exact path="/login">
                        {member.isAuth ? <Redirect to="/" /> : <Login />}
                    </Route>

                    <Route exact path="/sellerSignup">
                        <SellerSignUp />
                    </Route>

                    <Route exact path="/profile">
                        {member.isAuth ? <Profile /> : <Redirect to="/login" />}
                    </Route>

                    <Route exact path="/sellerProfile">
                        {member.isAuth ? (
                            <SellerProfile />
                        ) : (
                            <Redirect to="/login" />
                        )}
                    </Route>

                    <Route path="/product/:id">
                        <ProductDetail />
                    </Route>

                    <Route exact path="/cart">
                        {member.isAuth ? <Cart /> : <Redirect to="/login" />}
                    </Route>

                    <Route exact path="/checkout">
                        {member.isAuth ? (
                            <Checkout />
                        ) : (
                            <Redirect to="/login" />
                        )}
                    </Route>
                </Switch>

                <Footer />
            </Router>
        </>
    );
};

export default App;
