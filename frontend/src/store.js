import { combineReducers, configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
import {productDatailReducer, productListReducer} from './reducers/productReducers' 
import {cartReducer} from './reducers/cartReducer'
import { userLoginReducer, userRegisterReducer } from './reducers/userReducer'
const reducer = combineReducers({
    productList: productListReducer,
    productDetails: productDatailReducer,
    cart: cartReducer,
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
})
const cartItemsFromStorage = localStorage.getItem('cartItems') 
    ? JSON.parse(localStorage.getItem('cartItems')) 
    : [];
const userInfoFromStorage = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

const initialState = {
    cart: { cartItems: cartItemsFromStorage},
    userLogin: {userInfo: userInfoFromStorage}
}
const store = configureStore({
    reducer,
    preloadedState: initialState,
    middleware: [thunk],
})
 
export default store