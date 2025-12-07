// App.js or Layout component
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from './features/cart/cartSlice';

const App = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchCart());
        }
    }, [dispatch, user]);

    // ... rest of your app
};