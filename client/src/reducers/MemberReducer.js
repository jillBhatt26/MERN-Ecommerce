const MemberReducer = (state, action) => {
    switch (action.type) {
        case 'SIGNUP':
        case 'LOGIN':
            return {
                ...state,
                member_id: action.payload.member_id,
                username: action.payload.username,
                isAuth: true,
                isSeller: action.payload.isSeller
            };

        case 'LOGOUT':
            return {
                ...state,
                member_id: '',
                username: '',
                isAuth: false
            };

        case 'SELLER_SIGNUP':
            return {
                ...state,
                isSeller: true
            };

        default:
            return state;
    }
};

export default MemberReducer;
