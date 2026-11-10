import { useState, useEffect } from 'react';
import { RotateCcw, Receipt, PackageCheck } from 'lucide-react';
import API from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [reason, setReason] = useState('Size / Fit Issue');
  const [comments, setComments] = useState('');

  const loadOrders = async () => {
    try {
      const { data } = await API.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/orders/return', {
        order_id: returnModalOrder.id,
        reason,
        comments,
      });
      setReturnModalOrder(null);
      setComments('');
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Return request failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-[#4A0E1C] mb-6">My Orders, Transactions & Returns</h2>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-amber-100">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200 space-y-4"
            >
              {/* Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div>
                  <span className="font-bold text-[#4A0E1C] text-base">Order #{order.id}</span>
                  <span className="text-xs text-gray-500 ml-3">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-amber-100 text-[#4A0E1C] px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    {order.transaction_ref} ({order.payment_method} - {order.payment_status})
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" />
                    {order.order_status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-amber-50"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.selected_size} | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      ₹{Number(item.price_at_purchase).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer & Return Option */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-sm">
                <p className="font-bold text-[#4A0E1C]">
                  Total Paid: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </p>

                {order.return_id ? (
                  <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg font-semibold">
                    Return Status: {order.return_status} ({order.return_reason})
                  </span>
                ) : (
                  <button
                    onClick={() => setReturnModalOrder(order)}
                    className="flex items-center gap-1.5 text-xs border border-red-300 text-red-700 hover:bg-red-50 px-3.5 py-1.5 rounded-lg font-semibold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return Item</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleReturnSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-[#4A0E1C]">
              Return Order #{returnModalOrder.id}
            </h3>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Return Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
              >
                <option>Size / Fit Issue</option>
                <option>Design Different from Image</option>
                <option>Damaged / Defective Item</option>
                <option>Changed Mind</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Additional Notes</label>
              <textarea
                rows="3"
                placeholder="Tell us more..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#4A0E1C] text-amber-300 px-5 py-2 rounded-xl text-sm font-semibold"
              >
                Submit Return
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}