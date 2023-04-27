import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux'
import {Col, Row, ListGroup, Image, Card, Button} from 'react-bootstrap';
import axios from 'axios';
import { PayPalButtons, usePayPalScriptReducer} from '@paypal/react-paypal-js';
import Message from '../components/Message';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { deliverOrder, getOrderDeatails, payOrder } from '../actions/orderActions';
import { ORDER_DELIVER_RESET, ORDER_PAY_RESET } from '../constans/orderConstants';

const OrderScreen = () => {
    const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
    const [sdkReady, setSdkReady] = useState(false)
    const dispatch = useDispatch();
    const params = useParams();
    const orderId = params.id
    const orderDetails = useSelector((state) => state.orderDetails)
    const { order, loading, error } = orderDetails

    const orderPay = useSelector((state) => state.orderPay)
    const {loading: loadingPay, success: successPay } = orderPay

    const orderDeliver = useSelector((state) => state.orderDeliver)
    const {loading: loadingDeliver, success: successDeliver } = orderDeliver

    const userLogin = useSelector((state) => state.userLogin)
    const {userInfo } = userLogin
    
    useEffect(() => {
        const addPaypalScript = async () => {
            const {data: clientId} = await axios.get('/api/config/paypal')
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
            script.async = true
            script.onload = () => {
                setSdkReady(true)
            }
            document.body.appendChild(script)
        }
        if(!order || successPay || successDeliver) {
            dispatch({type: ORDER_PAY_RESET})
            dispatch({type: ORDER_DELIVER_RESET})
            dispatch(getOrderDeatails(orderId))
        } else if(!order.isPaid) {
            if(!window.paypal) {
                addPaypalScript()
            } else {
                setSdkReady(true)
            }
        }
        
    }, [successPay, orderId, dispatch, order, successDeliver]) 

    if(!loading) {
        const addDecimals = (num) => {
            return (Math.round(num * 100) / 100).toFixed(2)
        }
        order.itemsPrice = addDecimals(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0))
    }
    useEffect(() => {
        if (!order || order._id !== orderId || successPay) {
          dispatch({ type: ORDER_PAY_RESET });
          dispatch(getOrderDeatails(orderId));
        }
      }, [dispatch, order, orderId, successPay]);
    const createOrder = (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: { value: order.totalPrice }
            }
          ]
        });
      };
    const successPaymentHandler = (data, actions) => {
        return actions.order.capture().then(details => {
          dispatch(payOrder(orderId, details));
        });
      };
    const deliverHandler = () => {
        dispatch(deliverOrder(order))
    }
    return loading ? <Loader/> : error ? <Message variant='danger'>{error}</Message> :
        <>
            <h1>Order: {order._id}</h1>
            <Row>
            <Col md={8}>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Shipping</h2>
                        <p><strong>Name: </strong> {order.user.name}</p>
                        <p><strong>Email: </strong><a href={`mailto:${order.user.email}`} >{order.user.email}</a></p>
                        <p>
                            <strong>Address:</strong>
                            {' '}{order.shippingAddress.address},  {order.shippingAddress.city},  {order.shippingAddress.postalCode},{' '},  
                            {order.shippingAddress.country}
                        </p>
                        {order.isDelivered ? <Message variant='success'>Delivered on: {order.deliveredAt}</Message> : <Message variant='danger'>Not delivered</Message>}
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Payment Method</h2>
                        <p>
                            <strong>Method:</strong>
                            {' '}{order.paymentMethod}
                        </p>
                        {order.isPaid ? <Message variant='success'>Paid on: {order.paidAt}</Message> : <Message variant='danger'>Not paid</Message>}
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Order Items</h2>
                        {order.orderItems.legth === 0 ? <Message>Order is empty</Message> : (
                            <ListGroup variant='flush'>
                                {order.orderItems.map((item, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col md={1}>
                                                <Image src={item.image} alt={item.name} fluid rounded/>
                                            </Col>
                                            <Col>
                                                <Link to={`/product/${item.product}`}>
                                                    {item.name}
                                                </Link>
                                            </Col>
                                            <Col md={4}>
                                                {item.qty} x ${item.price} = ${item.qty * item.price}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Order Summary:</h2>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Items</Col>
                                <Col>${order.itemsPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Shipping</Col>
                                <Col>${order.shippingPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Tax</Col>
                                <Col>${order.taxPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Total</Col>
                                <Col>${order.totalPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        {!order.isPaid && (
                            <ListGroup.Item>
                            {loadingPay && <Loader />}
                            {isPending && <Loader />}
                            {isRejected && (
                                <Message variant="danger">SDK load error</Message>
                            )}
                            {isResolved && (
                                <PayPalButtons
                                createOrder={createOrder}
                                onApprove={successPaymentHandler}
                                />
                                )}
                                </ListGroup.Item>
                        )}
                        {loadingDeliver && <Loader />}
                        {userInfo &&
                            userInfo.data.isAdmin &&
                            order.isPaid &&
                            !order.isDelivered && (
                            <ListGroup.Item>
                                <Button
                                type='button'
                                className='btn btn-block'
                                onClick={deliverHandler}
                                >
                                Mark As Delivered
                                </Button>
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
        </>
};

export default OrderScreen;