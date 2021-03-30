// hooks import
import { useContext, useEffect, useState } from 'react';

// context import
import { AppContext } from '../../contexts/AppContext';

// react-router-dom
import { Link, NavLink, useHistory } from 'react-router-dom';

// react-icons
import { AiOutlineShoppingCart } from 'react-icons/ai';

// materialize css imports
import M from 'materialize-css/dist/js/materialize.min.js';

const Navbar = () => {
    const { member, dispatchMember } = useContext(AppContext);
    const [isSeller, setIsSeller] = useState(false);

    const history = useHistory();

    useEffect(() => {
        // const M = window.M;
        // // M.AutoInit();

        // document.addEventListener('DOMContentLoaded', function () {
        //     let elements = document.querySelectorAll('.sidenav');
        //     M.Sidenav.init(elements, {});
        // });

        let sidenav = document.querySelector('#slide-out');
        M.Sidenav.init(sidenav, {});
    }, []);

    useEffect(() => {
        setIsSeller(member.isSeller);
    }, [member.isSeller]);

    // event listeners
    const HandleLogout = () => {
        // send logout request to server to clear the cookie
        fetch('http://localhost:5000/member/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(() => {
                dispatchMember({ type: 'LOGOUT' });

                history.push('/');
            })
            .catch(err => console.log(err));
    };

    return member.isAuth ? (
        <nav>
            <div className="nav-wrapper blue darken-3">
                <Link
                    to="#"
                    data-target="slide-out"
                    className="sidenav-trigger"
                >
                    <i className="material-icons">menu</i>
                </Link>
                <div className="container">
                    <Link to="/" className="brand-logo">
                        E-CommApp
                    </Link>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        {isSeller && (
                            <li>
                                <NavLink to="/sellerProfile">
                                    Seller Profile
                                </NavLink>
                            </li>
                        )}
                        <li>
                            <NavLink to="/profile">{member.username}</NavLink>
                        </li>

                        <li>
                            <Link to="/cart">
                                <AiOutlineShoppingCart
                                    style={{
                                        fontSize: '2em',
                                        marginTop: '18px'
                                    }}
                                />
                            </Link>
                        </li>
                        <li>
                            <NavLink to="#" onClick={HandleLogout}>
                                Logout
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <ul className="sidenav blue darken-3 white-text" id="slide-out">
                    {isSeller && (
                        <li className="mt-5">
                            <NavLink to="/sellerProfile">
                                Seller Profile
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink to="/profile">{member.username}</NavLink>
                    </li>

                    <li>
                        <Link to="/cart">
                            <span className="hide-on-mid-and-down">cart</span>
                            <AiOutlineShoppingCart
                                style={{
                                    fontSize: '2em',
                                    marginTop: '18px'
                                }}
                            />
                        </Link>
                    </li>
                    <li>
                        <NavLink to="#" onClick={HandleLogout}>
                            Logout
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    ) : (
        <nav>
            <div className="nav-wrapper blue darken-3">
                <Link
                    to="#"
                    data-target="slide-out"
                    className="sidenav-trigger"
                >
                    <i className="material-icons">menu</i>
                </Link>

                <div className="container">
                    <Link to="/" className="brand-logo">
                        E-CommApp
                    </Link>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li>
                            <NavLink to="/signup">Sign Up</NavLink>
                        </li>
                        <li>
                            <NavLink to="/login">Log In</NavLink>
                        </li>
                    </ul>
                </div>

                <ul className="sidenav blue darken-3 white-text" id="slide-out">
                    <li className="mt-5">
                        <NavLink to="/signup">Sign Up</NavLink>
                    </li>
                    <li>
                        <NavLink to="/login">Log In</NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
