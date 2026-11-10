import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    pincode: '502313',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isRegister) {
        await register(formData);
        setSuccess('Account created! Please login now.');
        setIsRegister(false);
      } else {
        const user = await login(formData.email, formData.password);
        navigate(user.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex bg-[#4A0E1C] text-amber-300 p-3 rounded-full mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#4A0E1C]">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Kethaki Ladies Emporium</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-amber-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-amber-500"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-amber-500"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-amber-500"
          />

          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Delivery Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-amber-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Pincode (e.g. 502313)"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-amber-500"
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                >
                  <option value="customer">Customer Account</option>
                  <option value="admin">Store Admin Account</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-[#4A0E1C] hover:bg-[#631527] text-amber-300 font-semibold py-2.5 rounded-lg transition shadow"
          >
            {isRegister ? 'Register Account' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#4A0E1C] font-bold underline"
          >
            {isRegister ? 'Login here' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  );
}