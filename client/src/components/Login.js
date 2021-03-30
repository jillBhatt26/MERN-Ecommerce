// hooks
import { useState, useContext } from 'react';

// context
import { AppContext } from '../contexts/AppContext';

// react-router-dom
import { useHistory, useLocation } from 'react-router-dom';

const Login = () => {
    const { dispatchMember } = useContext(AppContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useHistory();
    const location = useLocation();

    const HandleLogin = event => {
        event.preventDefault();

        if (username.length && password.length) {
            fetch('http://localhost:5000/member/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    const { member_id, username, isSeller, errMsg } = data;

                    if (errMsg) {
                        alert(errMsg);
                    } else {
                        dispatchMember({
                            type: 'LOGIN',
                            payload: { member_id, username, isSeller }
                        });

                        if (
                            location.state &&
                            location.state.from === 'productDetail'
                        ) {
                            const { product_id, seller_id } = location.state;

                            history.push({
                                pathname: '/cart',
                                state: {
                                    from: 'loginPage',
                                    product_id,
                                    seller_id
                                }
                            });
                        } else if (
                            location.state &&
                            location.state.from === 'product'
                        ) {
                            const { product_id, seller_id } = location.state;

                            history.push({
                                pathname: '/',
                                state: {
                                    from: 'loginPage',
                                    product_id,
                                    seller_id
                                }
                            });

                            // history.push({
                            //     pathname: '/cart',
                            //     state: {
                            //         from: 'loginPage',
                            //         product_id,
                            //         seller_id
                            //     }
                            // });
                        } else {
                            history.push('/');
                        }
                    }
                })
                .catch(err => console.log(err));
        } else {
            alert('All Fields Required!');
        }
    };

    return (
        <div>
            <h3 className="center">Login</h3>
            <div className="row">
                <form
                    className="col s12 m4 offset-m4"
                    autoComplete="off"
                    onSubmit={HandleLogin}
                >
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="center mt-3">
                        <button className="btn waves-effect waves-dark blue darken-3">
                            <i className="material-icons right">login</i>
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
