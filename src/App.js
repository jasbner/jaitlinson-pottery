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

export default function PotteryGallery() {
  const [pottery, setPottery] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const loadPottery = async () => {
      try {
        const items = await fetchPotteryFromFirebase();
        setPottery(items);
      } catch (err) {
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

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex items-center justify-center">
        <div className="text-stone-600 text-lg">Loading pottery...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif text-stone-900 tracking-tight">Jaitlinson Pottery</h1>
          </div>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative p-3 hover:bg-stone-100/70 rounded-full transition-all duration-200 group"
          >
            <ShoppingCart className="w-6 h-6 text-stone-700 group-hover:text-stone-900 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium shadow-lg">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 transition-opacity" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-stone-900">Your Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 text-lg">Your cart is empty</p>
                  <p className="text-stone-400 text-sm mt-2">Add some beautiful pottery to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 pb-4 border-b border-stone-200 group">
                        <img src={item.imageURL} alt={item.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-stone-900 truncate">{item.name}</h3>
                          <p className="text-amber-700 font-medium mt-1">${item.price}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-stone-200 pt-4 mb-6">
                    <div className="flex justify-between text-xl font-serif">
                      <span className="text-stone-700">Total:</span>
                      <span className="text-stone-900 font-medium">${cartTotal}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl font-medium">
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Gallery Grid */}
        {pottery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pottery.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-amber-50">
                  <img 
                    src={item.imageURL} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif text-stone-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-stone-600 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-serif text-amber-700">${item.price}</span>
                    {item.available ? (
                      <button 
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-stone-800 to-stone-900 text-white px-5 py-2.5 rounded-xl hover:from-stone-900 hover:to-black transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <span className="text-stone-400 text-sm font-medium bg-stone-100 px-4 py-2 rounded-lg">Sold Out</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-stone-400" />
            </div>
            <p className="text-stone-500 text-xl">No pottery items to display yet.</p>
            <p className="text-stone-400 mt-2">Check back soon for new pieces!</p>
          </div>
        )}
      </main>
    </div>
  );
}