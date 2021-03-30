const ProductsReducer = (state, action) => {
    switch (action.type) {
        case 'LOADED':
            return {
                ...state,
                products: [...state.products, action.payload.products]
            };

        case 'NEW_PRODUCT':
            return {
                ...state,
                products: [...state.products, action.payload.newProduct]
            };

        default:
            return state;
    }
};

export default ProductsReducer;
