import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-10 shadow border border-amber-100">
          <ShoppingBag className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#4A0E1C]">Your Jewellery Bag is Empty</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Explore our latest rings, bangles, jhumkas, and bridal sets.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#4A0E1C] text-amber-300 px-6 py-2.5 rounded-xl font-semibold hover:bg-[#631527]"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-[#4A0E1C] mb-6">Shopping Cart ({cart.length} items)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const unitPrice = Number(item.discount_price || item.price);
            return (
              <div
                key={item.cart_item_id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl bg-amber-50"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    {item.category} • Size: <span className="font-semibold">{item.selected_size}</span>
                  </p>
                  <p className="text-sm font-bold text-[#4A0E1C] mt-1">
                    ₹{unitPrice.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                    className="p-1 hover:text-[#4A0E1C]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold px-1">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                    className="p-1 hover:text-[#4A0E1C]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.cart_item_id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Price Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 h-fit">
          <h3 className="font-bold text-lg text-[#4A0E1C] border-b pb-3 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Insured Delivery</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#4A0E1C] border-t pt-3 mt-3">
              <span>Total Payable</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full mt-6 bg-[#4A0E1C] hover:bg-[#631527] text-amber-300 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}