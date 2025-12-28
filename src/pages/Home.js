import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X } from 'lucide-react';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

let firebaseApp = null;
let firestore = null;

const initFirebase = async () => {
  if (firebaseApp) return firestore;
  
  try {
    await new Promise((resolve, reject) => {
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-app-compat.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-firestore-compat.min.js';
        script2.onload = resolve;
        script2.onerror = reject;
        document.head.appendChild(script2);
      };
      script1.onerror = reject;
      document.head.appendChild(script1);
    });

    firebaseApp = window.firebase.initializeApp(firebaseConfig);
    firestore = firebaseApp.firestore();
    return firestore;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

const fetchPotteryFromFirebase = async () => {
  try {
    const db = await initFirebase();
    if (!db) throw new Error('Failed to initialize Firebase');
    
    const snapshot = await db.collection('pottery-image').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return items;
  } catch (error) {
    console.error('Error fetching pottery:', error);
    throw error;
  }
};

export default function Home() {
  const [pottery, setPottery] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('potteryCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('potteryCart', JSON.stringify(cart));
      console.log('Cart saved to localStorage:', cart);
    }
  }, [cart]);

  useEffect(() => {
    const loadPottery = async () => {
      try {
        const items = await fetchPotteryFromFirebase();
        if (items.length === 0) {
          setError('No pottery items found in database');
        } else {
          setPottery(items);
          setError(null);
        }
      } catch (err) {
        setError(err.message);
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPottery();
  }, []);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);

    try {
      const response = await fetch(
        `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/createCheckoutSession`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cart
          }),
        }
      );

      const { sessionId, error: checkoutError } = await response.json();

      if (checkoutError) {
        throw new Error(checkoutError);
      }

      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Loading pottery from Firebase...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <script src="https://js.stripe.com/v3/"></script>

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif text-stone-800">Artisan Pottery</h1>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 hover:bg-stone-100 rounded-lg transition"
          >
            <ShoppingCart className="w-6 h-6 text-stone-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif text-stone-800">Your Cart</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-6 h-6 text-stone-600" />
              </button>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-stone-500">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 pb-4 border-b">
                      <img src={item.imageURL} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-stone-800">{item.name}</h3>
                        <p className="text-stone-600">${item.price}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Loading...' : 'Checkout with Stripe'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-stone-800 mb-2">Handcrafted Pottery</h2>
          <p className="text-stone-600">Each piece is uniquely made with care</p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ {error}</h3>
            <p className="text-sm text-yellow-800">
              Make sure you've added pottery items to your "pottery-image" collection in Firestore.
            </p>
          </div>
        )}

        {pottery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pottery.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="aspect-square overflow-hidden bg-stone-100">
                  <img 
                    src={item.imageURL} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-stone-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-stone-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-medium text-stone-800">${item.price}</span>
                    {item.available ? (
                      <button 
                        onClick={() => addToCart(item)}
                        className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <span className="text-stone-400 text-sm">Sold Out</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !error && (
          <div className="text-center py-12 text-stone-500">
            <p>No pottery items to display yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}