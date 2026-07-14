import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API = 'http://localhost:5000/api';
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// ========== COMPONENTS ==========

// Login Page
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@wastewatch.com');
  const [password, setPassword] = useState('Admin@123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
      toast.success('Login successful!');
      onLogin(data.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WasteWatch Pro</h1>
          <p className="text-gray-500">Hospital Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">Demo: admin@wastewatch.com / Admin@123</p>
      </div>
    </div>
  );
};

// Dashboard
const Dashboard = ({ user, medicines, batches, heatMap }) => {
  const stats = [
    { title: 'Medicines', value: medicines?.length || 0, color: 'blue' },
    { title: 'Batches', value: batches?.length || 0, color: 'purple' },
    { title: 'Critical Expiry', value: heatMap?.data?.critical?.length || 0, color: 'red' },
    { title: 'Total Items', value: (medicines?.length || 0) + (batches?.length || 0), color: 'green' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-gray-500">Welcome, {user?.fullName || 'Admin'}!</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-500 text-sm">{s.title}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">⚠️ Priority List</h3>
          {batches?.filter(b => !b.isUsed && b.quantity > 0).slice(0, 5).map((b, i) => (
            <div key={i} className="flex justify-between items-center p-2 border-b">
              <span className="text-sm">{b.batchNumber} - {b.medicineId?.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {Math.ceil((new Date(b.expiryDate) - new Date()) / (1000*60*60*24))} days
              </span>
            </div>
          ))}
          {(!batches || batches.length === 0) && <p className="text-gray-500 text-center py-4">No batches</p>}
        </div>

        {/* Heat Map Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">📊 Expiry Heat Map</h3>
          {heatMap?.data ? (
            <div className="space-y-2">
              {Object.entries(heatMap.data).map(([key, items]) => (
                <div key={key} className="flex justify-between items-center p-2 rounded-lg" style={{
                  background: key === 'critical' ? '#fef2f2' : key === 'high' ? '#fff7ed' : 
                             key === 'medium' ? '#fefce8' : key === 'low' ? '#f0fdf4' : '#f3f4f6'
                }}>
                  <span className="capitalize font-medium">{key}</span>
                  <span className="font-bold">{items?.length || 0}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-4">No data</p>}
        </div>
      </div>
    </div>
  );
};

// Medicine List
const MedicineList = ({ medicines, onDelete }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Medicines</h1>
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Manufacturer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th></tr>
        </thead>
        <tbody>
          {medicines?.map(m => (
            <tr key={m._id} className="border-t">
              <td className="px-6 py-3 font-medium">{m.name}</td>
              <td className="px-6 py-3">{m.category}</td>
              <td className="px-6 py-3">{m.manufacturer}</td>
              <td className="px-6 py-3">
                <button onClick={() => onDelete(m._id)} className="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          ))}
          {(!medicines || medicines.length === 0) && <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No medicines</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

// ========== MAIN APP ==========

function App() {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [heatMap, setHeatMap] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [medRes, batRes, heatRes] = await Promise.all([
        axios.get(`${API}/medicines`, headers),
        axios.get(`${API}/batches`, headers),
        axios.get(`${API}/batches/heatmap`, headers)
      ]);
      setMedicines(medRes.data.data);
      setBatches(batRes.data.data);
      setHeatMap(heatRes.data);
    } catch (err) { console.error('Error fetching data:', err); }
  };

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      fetchData();
    }
  }, [token]);

  const handleDeleteMedicine = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/medicines/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Medicine deleted');
      setMedicines(medicines.filter(m => m._id !== id));
    } catch (err) { toast.error('Delete failed'); }
  };

  if (!token) return <Login onLogin={(u) => { setUser(u); setToken(localStorage.getItem('token')); }} />;

  const menuItems = ['dashboard', 'medicines'];

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white h-full fixed left-0 top-0">
        <div className="p-4 border-b border-blue-700"><span className="text-xl font-bold">WasteWatch</span></div>
        <nav className="p-4">
          {['Dashboard', 'Medicines'].map((item) => (
            <button key={item} onClick={() => setCurrentPage(item.toLowerCase())} 
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition ${currentPage === item.toLowerCase() ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
              {item}
            </button>
          ))}
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); toast.success('Logged out'); }}
            className="w-full text-left px-4 py-3 rounded-lg mt-4 hover:bg-red-600/20 text-red-300 transition">
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6 overflow-y-auto">
        {currentPage === 'dashboard' && <Dashboard user={user} medicines={medicines} batches={batches} heatMap={heatMap} />}
        {currentPage === 'medicines' && <MedicineList medicines={medicines} onDelete={handleDeleteMedicine} />}
      </div>
    </div>
  );
}

export default App;
