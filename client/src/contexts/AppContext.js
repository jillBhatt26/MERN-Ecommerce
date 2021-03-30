import { createContext, useReducer } from 'react';

// reducer imports
import CartReducer from '../reducers/CartReducer';
import MemberReducer from '../reducers/MemberReducer';
import ProductsReducer from '../reducers/ProductsReducer';
import OrdersReducer from '../reducers/OrdersReducer';

// import initial states
import initMemberState from '../InitialStates/MemberState';
import initProductsState from '../InitialStates/ProductsState';
import initCartState from '../InitialStates/CartState';
import initOrdersState from '../InitialStates/OrdersState';

// context creation and export
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    // member reducer
    const [member, dispatchMember] = useReducer(MemberReducer, initMemberState);

    // products reducer
    const [products, dispatchProduct] = useReducer(
        ProductsReducer,
        initProductsState
    );

    // cart reducer
    const [cart, dispatchCart] = useReducer(CartReducer, initCartState);

    // orders reducer
    const [orders, dispatchOrders] = useReducer(OrdersReducer, initOrdersState);

    return (
        <AppContext.Provider
            value={{
                member,
                dispatchMember,
                products,
                dispatchProduct,
                cart,
                dispatchCart,
                orders,
                dispatchOrders
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
