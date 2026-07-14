import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiHome, FiPackage, FiBox, FiGrid, FiCalendar, FiDollarSign, 
  FiBookOpen, FiCheckSquare, FiBarChart2, FiUser, FiLogOut,
  FiMenu, FiX, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiMail, FiLock, FiArrowRight, FiUsers, FiAlertCircle
} from 'react-icons/fi';

const API = 'http://localhost:5000/api';

// ========== AXIOS CONFIG ==========
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

// ========== COMPONENTS ==========

// Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@wastewatch.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
      toast.success('Login successful!');
      onLogin(data.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
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
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10" required />
            </div>
          </div>
          <button type="submit" disabled={loading} 
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {loading ? 'Signing in...' : <><FiArrowRight /> Sign In</>}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">Demo: admin@wastewatch.com / Admin@123</p>
      </div>
    </div>
  );
};

// Layout Component
const Layout = ({ children, user, onLogout, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: 'dashboard' },
    { icon: FiPackage, label: 'Medicines', path: 'medicines' },
    { icon: FiBox, label: 'Batches', path: 'batches' },
    { icon: FiGrid, label: 'Heat Map', path: 'heatmap' },
    { icon: FiCalendar, label: 'Priority', path: 'priority' },
    { icon: FiDollarSign, label: 'Payroll', path: 'payroll' },
    { icon: FiBookOpen, label: 'Research', path: 'research' },
    { icon: FiCheckSquare, label: 'Tasks', path: 'tasks' },
    { icon: FiBarChart2, label: 'Analytics', path: 'analytics' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-blue-800 text-white w-64 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">W</span>
            </div>
            <span className="font-bold text-lg">WasteWatch</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><FiX size={24} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => { setCurrentPage(item.path); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === item.path ? 'bg-blue-700' : 'hover:bg-blue-700/50'}`}>
              <item.icon size={20} /><span>{item.label}</span>
            </button>
          ))}
          <div className="border-t border-blue-700 mt-4 pt-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-700/50 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"><FiUser size={20} /></div>
              <div><p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p><p className="text-xs text-gray-300">{user?.role}</p></div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-300 hover:text-red-200 transition">
              <FiLogOut size={20} /><span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><FiMenu size={24} /></button>
            <h1 className="text-xl font-semibold capitalize">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg"><FiTrendingUp size={20} /></button>
            <span className="text-sm text-gray-500">{user?.fullName}</span>
          </div>
        </header>
        <main className="p-6 overflow-y-auto h-[calc(100vh-72px)]">{children}</main>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ medicines, batches, heatMap, payroll }) => {
  const stats = [
    { title: 'Medicines', value: medicines?.length || 0, icon: FiPackage, color: 'blue' },
    { title: 'Batches', value: batches?.length || 0, icon: FiBox, color: 'purple' },
    { title: 'Critical', value: heatMap?.critical?.length || 0, icon: FiAlertCircle, color: 'red' },
    { title: 'Staff', value: 12, icon: FiUsers, color: 'green' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{s.title}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
              <div className={`p-3 bg-${s.color}-50 rounded-lg`}><s.icon className={`text-${s.color}-600`} size={24} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">⚠️ Priority List</h3>
          {batches?.filter(b => !b.isUsed && b.quantity > 0).slice(0, 5).map((b, i) => (
            <div key={i} className="flex justify-between items-center p-2 border-b">
              <span className="text-sm">{b.batchNumber} - {b.medicineId?.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{b.daysLeft || 0} days</span>
            </div>
          ))}
          {(!batches || batches.length === 0) && <p className="text-gray-500 text-center py-4">No batches</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">📊 Expiry Heat Map</h3>
          {heatMap ? (
            <div className="space-y-2">
              {Object.entries(heatMap).map(([key, items]) => (
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

// Medicine List Component
const MedicineList = ({ medicines, onDelete, onEdit }) => {
  const [search, setSearch] = useState('');
  const filtered = medicines?.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FiPlus /> Add
          </button>
        </div>
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
            {filtered?.map(m => (
              <tr key={m._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{m.name}</td>
                <td className="px-6 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{m.category}</span></td>
                <td className="px-6 py-3">{m.manufacturer}</td>
                <td className="px-6 py-3 flex gap-2">
                  <button onClick={() => onEdit(m)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                  <button onClick={() => onDelete(m._id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {(!filtered || filtered.length === 0) && <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No medicines</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== MAIN APP ==========

function App() {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [heatMap, setHeatMap] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [medRes, batRes, heatRes, payRes] = await Promise.all([
        axios.get(`${API}/medicines`, headers),
        axios.get(`${API}/batches`, headers),
        axios.get(`${API}/batches/heatmap`, headers),
        axios.get(`${API}/payroll`, headers).catch(() => ({ data: { data: [] } }))
      ]);
      setMedicines(medRes.data.data || []);
      setBatches(batRes.data.data || []);
      setHeatMap(heatRes.data.data || {});
      setPayroll(payRes.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      fetchData();
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out');
  };

  const handleDeleteMedicine = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await axios.delete(`${API}/medicines/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Medicine deleted');
      setMedicines(medicines.filter(m => m._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard medicines={medicines} batches={batches} heatMap={heatMap} payroll={payroll} />;
      case 'medicines': return <MedicineList medicines={medicines} onDelete={handleDeleteMedicine} onEdit={() => {}} />;
      case 'batches': return <div className="text-gray-500">Batches page - Coming soon</div>;
      case 'heatmap': return <div className="text-gray-500">Heat Map page - Coming soon</div>;
      case 'priority': return <div className="text-gray-500">Priority List page - Coming soon</div>;
      case 'payroll': return <div className="text-gray-500">Payroll page - Coming soon</div>;
      default: return <Dashboard medicines={medicines} batches={batches} heatMap={heatMap} payroll={payroll} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Layout user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : renderPage()}
      </Layout>
    </>
  );
}

export default App;
