import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, User, LogOut, Sparkles, ShieldCheck, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, selectedPincode, locationInfo, checkLocation, clearLocation } = useCart();
  const [pinInput, setPinInput] = useState(selectedPincode);
  const [showPinModal, setShowPinModal] = useState(false);
  const navigate = useNavigate();

  const handlePinCheck = async (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    await checkLocation(pinInput.trim());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#4A0E1C] text-amber-50 shadow-lg border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-amber-400 text-[#4A0E1C] p-2 rounded-full shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-wide text-amber-300 leading-tight">
              KETHAKI LADIES EMPORIUM
            </h1>
            <p className="text-[11px] text-amber-200/80 tracking-widest uppercase">
              Fine Jewellery & Bridal Collections
            </p>
          </div>
        </Link>

        {/* Location Availability Trigger */}
        <button
          onClick={() => setShowPinModal(!showPinModal)}
          className="flex items-center gap-1.5 bg-[#631527] hover:bg-[#7A1B31] px-3 py-1.5 rounded-full text-xs border border-amber-400/30 transition"
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>
            {selectedPincode
              ? `Delivering to: ${selectedPincode}`
              : 'Check Location Availability'}
          </span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-amber-300 transition">
            Collections
          </Link>

          {user && (
            <Link to="/orders" className="flex items-center gap-1 hover:text-amber-300 transition">
              <Package className="w-4 h-4" />
              <span>Orders & Returns</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1 bg-amber-400 text-[#4A0E1C] px-3 py-1 rounded-full font-semibold hover:bg-amber-300 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin CRUD</span>
            </Link>
          )}

          <Link to="/cart" className="relative flex items-center gap-1 hover:text-amber-300 transition">
            <ShoppingBag className="w-5 h-5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-[#4A0E1C] text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-amber-400/30">
              <span className="text-amber-200 hidden sm:inline">Hi, {user.full_name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-900/70 hover:bg-red-800 px-3 py-1.5 rounded-lg text-xs transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-amber-400 text-[#4A0E1C] px-4 py-1.5 rounded-lg font-semibold hover:bg-amber-300 transition"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Location Availability Bar */}
      {showPinModal && (
        <div className="bg-[#360914] px-4 py-3 border-t border-amber-400/20">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handlePinCheck} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Pincode (e.g. 502313, 502110, 500043)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="px-3 py-1.5 rounded bg-white text-gray-900 text-sm w-64 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-400 text-[#4A0E1C] px-4 py-1.5 rounded text-sm font-semibold hover:bg-amber-300"
              >
                Check & Filter Items
              </button>
              {selectedPincode && (
                <button
                  type="button"
                  onClick={() => {
                    clearLocation();
                    setPinInput('');
                  }}
                  className="text-xs text-amber-200 underline ml-2"
                >
                  Show All Locations
                </button>
              )}
            </form>

            {locationInfo && (
              <p className={`text-xs font-medium ${locationInfo.available ? 'text-emerald-300' : 'text-amber-300'}`}>
                {locationInfo.available
                  ? `✅ Available in ${locationInfo.location.area_name} (${locationInfo.location.city}) — Delivery in ${locationInfo.location.delivery_days} day(s)!`
                  : `⚠️ ${locationInfo.message}`}
              </p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}