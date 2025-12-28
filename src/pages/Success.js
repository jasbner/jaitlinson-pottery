import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear the cart from localStorage after successful checkout
    localStorage.removeItem('potteryCart');
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-serif text-stone-800 mb-4">
          Thank You for Your Order!
        </h1>
        
        <p className="text-stone-600 mb-6">
          Your payment has been processed successfully. You'll receive a confirmation email shortly with your order details.
        </p>

        {sessionId && (
          <div className="bg-stone-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-stone-500 mb-1">Order Reference</p>
            <p className="text-xs font-mono text-stone-700 break-all">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>

        <p className="text-sm text-stone-500 mt-6">
          Questions about your order? Contact us at support@example.com
        </p>
      </div>
    </div>
  );
}