import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Home, ShoppingCart } from 'lucide-react';

export default function Cancel() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart items from localStorage to show what was almost purchased
    const savedCart = localStorage.getItem('potteryCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-amber-600" />
        </div>
        
        <h1 className="text-3xl font-serif text-stone-800 mb-4">
          Checkout Cancelled
        </h1>
        
        <p className="text-stone-600 mb-6">
          No worries! Your items are still in your cart and waiting for you when you're ready.
        </p>

        {cartItems.length > 0 && (
          <div className="bg-stone-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-5 h-5 text-stone-600" />
              <h3 className="font-medium text-stone-800">Items in Your Cart</h3>
            </div>
            <div className="space-y-2 mb-3">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-stone-700">{item.name}</span>
                  <span className="text-stone-600">${item.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Gallery
          </button>
        </div>

        <p className="text-sm text-stone-500 mt-6">
          Need help? Contact us at support@example.com
        </p>
      </div>
    </div>
  );
}