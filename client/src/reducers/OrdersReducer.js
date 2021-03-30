const OrdersReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ORDERS':
            return {
                ...state,
                orders: action.orders
            };

        default:
            return state;
    }
};

export default OrdersReducer;
