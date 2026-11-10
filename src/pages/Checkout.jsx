import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, fetchCart, selectedPincode } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const directItem = location.state?.directItem;
  const checkoutItems = directItem
    ? [directItem]
    : cart.map((c) => ({
        product_id: c.product_id,
        name: c.name,
        selected_size: c.selected_size,
        quantity: c.quantity,
        price: Number(c.discount_price || c.price),
      }));

  const [address, setAddress] = useState(user?.address || '');
  const [pincode, setPincode] = useState(selectedPincode || user?.pincode || '502313');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const totalAmount = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/orders/place', {
        items: checkoutItems,
        shipping_address: address,
        pincode,
        payment_method: paymentMethod,
        clear_cart: !directItem,
      });
      if (!directItem) await fetchCart();
      setReceipt(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-emerald-200 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-[#4A0E1C]">Order Confirmed!</h2>
          <p className="text-sm text-gray-600 mt-1">
            Thank you for shopping at Kethaki Ladies Emporium.
          </p>

          <div className="bg-amber-50/70 rounded-xl p-4 my-6 text-left text-sm space-y-2 border border-amber-200">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-bold">#{receipt.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction Ref:</span>
              <span className="font-mono font-bold text-[#4A0E1C]">{receipt.transactionRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status:</span>
              <span className="font-semibold text-emerald-700">{receipt.paymentStatus}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">Amount Paid:</span>
              <span className="font-bold text-base">₹{Number(receipt.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-[#4A0E1C] text-amber-300 py-3 rounded-xl font-semibold hover:bg-[#631527]"
          >
            View Order & Transaction History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-[#4A0E1C] mb-6">Secure Checkout</h2>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 space-y-4">
          <h3 className="font-bold text-[#4A0E1C]">1. Delivery Details</h3>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Full Delivery Address</label>
            <textarea
              required
              rows="3"
              placeholder="House/Flat No, Street, Landmark, Village/Town..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-amber-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Pincode</label>
            <input
              type="text"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>

          <h3 className="font-bold text-[#4A0E1C] pt-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span>2. Payment Method</span>
          </h3>
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            {['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery'].map((method) => (
              <button
                type="button"
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`p-3 rounded-xl border text-left font-medium transition ${
                  paymentMethod === method
                    ? 'border-[#4A0E1C] bg-amber-50 text-[#4A0E1C]'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#4A0E1C] border-b pb-3 mb-4">Items ({checkoutItems.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {item.selected_size} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between text-lg font-bold text-[#4A0E1C] mb-4">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <button
              type="submit"
              disabled={loading || checkoutItems.length === 0}
              className="w-full bg-[#4A0E1C] hover:bg-[#631527] text-amber-300 font-semibold py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{loading ? 'Processing Payment...' : `Pay & Place Order`}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}