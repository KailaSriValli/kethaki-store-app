import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Zap, Sparkles, MapPin, Heart } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import VirtualTrialModal from '../components/VirtualTrialModal';

const CATEGORIES = ['All', 'Rings', 'Earrings', 'Bangles', 'Chains', 'Bracelets', 'Anklets', 'Necklaces', 'Other'];
const MATERIALS = ['All', 'Gold', '1 Gram Gold', 'Silver', 'Rose Gold', 'Imitation', 'Diamond'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [material, setMaterial] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [trialProduct, setTrialProduct] = useState(null);
  const [toast, setToast] = useState('');

  const { user } = useAuth();
  const { addToCart, selectedPincode } = useCart();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (material !== 'All') params.material = material;
      if (selectedPincode) params.pincode = selectedPincode;

      const { data } = await API.get('/products', { params });
      setProducts(data);
    } catch (err) {
      console.error('Error loading jewellery:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, material, selectedPincode]);

  useEffect(() => {
    if (user) {
      API.get('/wishlist')
        .then(({ data }) => setWishlistIds(data.map((item) => item.id)))
        .catch(() => setWishlistIds([]));
    } else {
      setWishlistIds([]);
    }
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleToggleWishlist = async (productId) => {
    if (!user) return navigate('/login');
    try {
      const { data } = await API.post('/wishlist/toggle', { product_id: productId });
      setWishlistIds((prev) =>
        data.wishlisted ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
      showToast(data.message);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) return navigate('/login');
    const sizes = product.available_sizes.split(',');
    const chosenSize = selectedSizes[product.id] || sizes[0].trim();
    await addToCart(product.id, chosenSize, 1);
    showToast(`Added "${product.name}" (${chosenSize}) to cart!`);
  };

  const handleOrderNow = (product) => {
    if (!user) return navigate('/login');
    const sizes = product.available_sizes.split(',');
    const chosenSize = selectedSizes[product.id] || sizes[0].trim();
    navigate('/checkout', {
      state: {
        directItem: {
          product_id: product.id,
          name: product.name,
          image_url: product.image_url,
          selected_size: chosenSize,
          quantity: 1,
          price: Number(product.discount_price || product.price),
        },
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#4A0E1C] text-amber-200 px-5 py-3 rounded-xl shadow-lg border border-amber-400 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#4A0E1C] via-[#6B1529] to-[#4A0E1C] rounded-2xl p-6 md:p-10 text-amber-50 mb-8 shadow-lg border border-amber-400/30">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full mb-3">
            <MapPin className="w-3.5 h-3.5" /> Visit Store or Order Online
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-amber-300 mb-2">
            Timeless Elegance at Kethaki Ladies Emporium
          </h2>
          <p className="text-sm md:text-base text-amber-100/90">
            Explore handcrafted Rings, Earrings, Bangles, Chains, Bracelets, Anklets & Bridal Harams with instant location availability and virtual try-on.
          </p>
        </div>
      </div>

      {/* Search & Material Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search rings, jhumkas, bangles, silver anklets, bridal sets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-amber-200 rounded-xl shadow-sm focus:outline-amber-500"
          />
        </div>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="px-4 py-2.5 bg-white border border-amber-200 rounded-xl shadow-sm text-sm font-medium"
        >
          {MATERIALS.map((mat) => (
            <option key={mat} value={mat}>
              {mat === 'All' ? 'All Materials / Purity' : mat}
            </option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              category === cat
                ? 'bg-[#4A0E1C] text-amber-300 shadow'
                : 'bg-white text-gray-700 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-amber-100">
          <p className="text-gray-500">No jewellery items match your filter or selected pincode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const sizes = product.available_sizes.split(',').map((s) => s.trim());
            const activeSize = selectedSizes[product.id] || sizes[0];
            const finalPrice = Number(product.discount_price || product.price);
            const isWishlisted = wishlistIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-amber-100 flex flex-col"
              >
                <div className="relative h-56 bg-amber-50">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#4A0E1C]/90 text-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {product.category} • {product.material}
                  </span>

                  <button
                    onClick={() => handleToggleWishlist(product.id)}
                    className="absolute top-3 right-3 bg-white/95 hover:bg-white p-2 rounded-full shadow transition"
                    title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-600'
                      }`}
                    />
                  </button>

                  {product.is_virtual_trial_enabled && (
                    <button
                      onClick={() => setTrialProduct(product)}
                      className="absolute bottom-3 right-3 bg-white/95 hover:bg-amber-300 text-[#4A0E1C] text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Try On</span>
                    </button>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>

                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-lg font-bold text-[#4A0E1C]">₹{finalPrice.toLocaleString('en-IN')}</span>
                      {product.discount_price && Number(product.discount_price) < Number(product.price) && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <span className="text-[11px] text-gray-500 block mb-1">Select Size:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: sz })}
                            className={`text-xs px-2 py-0.5 rounded border ${
                              activeSize === sz
                                ? 'bg-[#4A0E1C] text-amber-200 border-[#4A0E1C]'
                                : 'bg-gray-50 text-gray-700 border-gray-300'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center justify-center gap-1 border border-[#4A0E1C] text-[#4A0E1C] hover:bg-amber-50 py-2 rounded-lg text-xs font-semibold transition"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleOrderNow(product)}
                      className="flex items-center justify-center gap-1 bg-[#4A0E1C] hover:bg-[#631527] text-amber-300 py-2 rounded-lg text-xs font-semibold transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {trialProduct && (
        <VirtualTrialModal product={trialProduct} onClose={() => setTrialProduct(null)} />
      )}
    </div>
  );
}