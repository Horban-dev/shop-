import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ShippingScreen from "./screens/ShippingScreen";
import PaymentScreen from "./screens/PaymentScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import { PayPalScriptProvider} from "@paypal/react-paypal-js";
import axios from "axios";

 
const App = () => {

    const [clientID, setClientID] = useState('');
    useEffect(() => {
        const getClientId = async () => {
          const { data: clientId } = await axios.get('/api/config/paypal');
     
          setClientID(clientId);
        };
     
        if (!window.paypal) {
          getClientId();
        }
      }, []);
    return (

        <>
        {clientID && (
          <PayPalScriptProvider options={{ 'client-id': clientID }}>
            <Router>
            <Header />
            <main className='py-3'>
                <Container>
                    <Routes>
                        <Route path='/' element={<HomeScreen />}/>
                        <Route path='/product/:id' element={<ProductScreen />} />
                        <Route path='/cart/:id?' element={<CartScreen />} />
                        <Route path='/profile' element={<ProfileScreen />} />
                        <Route path='/login' element={<LoginScreen/>} />
                        <Route path='/register' element={<RegisterScreen/>} />
                        <Route path='/shipping' element={<ShippingScreen/>} />
                        <Route path='/payment' element={<PaymentScreen/>} />
                        <Route path='/placeorder' element={<PlaceOrderScreen/>} />
                        <Route path='/order/:id' element={<OrderScreen/>} />
                    </Routes>
                </Container>
            </main>
            <Footer />
        </Router>
          </PayPalScriptProvider>
        )}
      </>
    );
};
 
export default App;