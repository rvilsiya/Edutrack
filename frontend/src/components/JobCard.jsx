import { Briefcase, MapPin, Building } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleApply = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post(`/jobs/${job._id}/apply`);
      alert('Applied successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to apply');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-gray-100">
      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
      <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
        <div className="flex items-center gap-1">
          <Building size={16} />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={16} />
          <span>{job.location}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-6 line-clamp-3">{job.description}</p>
      <button
        onClick={handleApply}
        className="w-full bg-blue-50 text-blue-600 py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition"
      >
        <Briefcase size={18} /> Apply Now
      </button>
    </div>
  );
};

export default JobCard;
