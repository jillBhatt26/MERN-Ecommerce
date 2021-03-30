const CartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ITEMS':
            return {
                ...state,
                items: [...action.payload.items]
            };

        case 'RESET_ITEMS':
            return {
                ...state,
                items: []
            };

        default:
            return state;
    }
};

export default CartReducer;
