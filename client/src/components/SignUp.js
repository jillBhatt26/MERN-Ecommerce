// hooks import
import { useState, useContext } from 'react';

// context imports
import { AppContext } from '../contexts/AppContext';

// react-router-dom import
import { useHistory } from 'react-router-dom';

const SignUp = () => {
    const { dispatchMember } = useContext(AppContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePass, setRePass] = useState('');

    const history = useHistory();

    const HandleSignUp = event => {
        event.preventDefault();

        if (username && email && password && rePass) {
            if (password === rePass) {
                fetch('http://localhost:5000/member/signup', {
                    method: 'POST',
                    body: JSON.stringify({ username, email, password }),
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json ' }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { user_id, email, username, errMsg } = res;

                        if (errMsg) {
                            alert(errMsg);
                        } else {
                            dispatchMember({
                                type: 'SIGNUP',
                                payload: { user_id, email, username }
                            });

                            history.push('/');
                        }
                    })
                    .catch(err => console.log(err));
            } else {
                alert("Passwords don't match.");
            }
        } else {
            alert('All fields required!!');
        }
    };

    return (
        <div>
            <h3 className="center">Create Account</h3>
            <div className="row">
                <form
                    className="col s12 m4 offset-m4"
                    autoComplete="off"
                    onSubmit={HandleSignUp}
                >
                    <div className="input-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            name="re-pass"
                            placeholder="Retype Password"
                            value={rePass}
                            onChange={e => setRePass(e.target.value)}
                        />
                    </div>

                    <div className="center mt-3">
                        <button className="btn waves-effect waves-dark blue darken-3">
                            <i className="material-icons right">add</i>
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
