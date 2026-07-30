import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, User, Briefcase } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <BookOpen />
          EDUTRACK
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/courses" className="hover:text-blue-200">Courses</Link>
          <Link to="/jobs" className="hover:text-blue-200 flex items-center gap-1"><Briefcase size={18}/>Jobs</Link>
          {token ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-200 flex items-center gap-1"><User size={18}/>Dashboard</Link>
              <button onClick={handleLogout} className="flex items-center gap-1 bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 transition">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 border border-white rounded hover:bg-white hover:text-blue-600 transition">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
