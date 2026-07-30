import { useState, useEffect } from 'react';
import api from '../api';
import JobCard from '../components/JobCard';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <div className="text-center py-20">Loading jobs...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Job Board</h2>
      {jobs.length === 0 ? (
        <p className="text-gray-600">No jobs available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
