// hooks import
import { useState, useContext } from 'react';

// react-router-dom import
import { useHistory } from 'react-router-dom';

// context import
import { AppContext } from '../contexts/AppContext';

const SellerSignUp = () => {
    // states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [GSTIN, setGSTIN] = useState('');
    const [PAN, setPAN] = useState('');
    const [bankAccNo, setBankAccNo] = useState('');

    const { dispatchMember } = useContext(AppContext);

    // useHistory hook
    const history = useHistory();

    const HandleSubmit = event => {
        event.preventDefault();

        if (name && phone && address && GSTIN && PAN && bankAccNo) {
            fetch('http://localhost:5000/member/seller/signup', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    phone,
                    address,
                    GSTIN,
                    PAN,
                    bankAccNo
                }),
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    const { seller, errMsg } = data;

                    if (errMsg) {
                        alert(errMsg);
                    } else if (seller) {
                        dispatchMember({ type: 'SELLER_SIGNUP' });

                        history.push('/sellerProfile');
                    }
                })
                .catch(err => console.log(err));
        } else {
            alert('All Fields Required');
        }
    };

    return (
        <div className="row">
            <h3 className="center">Create Seller Account</h3>
            <form
                autoComplete="off"
                onSubmit={HandleSubmit}
                className="col s12 m4 offset-m4"
            >
                <div className="input-group">
                    <input
                        type="text"
                        name="name"
                        placeholder="Registered Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>

                <div className="input-field">
                    <textarea
                        id="textarea1"
                        placeholder="Full Address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="materialize-textarea"
                    ></textarea>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="GSTIN"
                        placeholder="Registered GST IN Number"
                        value={GSTIN}
                        onChange={e => setGSTIN(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="PAN"
                        placeholder="PAN Number"
                        value={PAN}
                        onChange={e => setPAN(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="bankAccNo"
                        placeholder="Bank Account Number"
                        value={bankAccNo}
                        onChange={e => setBankAccNo(e.target.value)}
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
    );
};

export default SellerSignUp;
