import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { BookOpen, Briefcase, Award } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/user/me');
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Failed to load your profile. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!userData) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-l-4 border-blue-600 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userData.user.name}!</h2>
          <p className="text-gray-600">Email: {userData.user.email} | Role: <span className="capitalize">{userData.user.role}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Enrolled Courses */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <BookOpen className="text-blue-600" />
            <h3 className="text-xl font-bold">Your Courses</h3>
          </div>
          <div className="flex-grow">
            {userData.enrolled_courses.length === 0 ? (
              <p className="text-gray-500 italic">You haven't enrolled in any courses yet.</p>
            ) : (
              <ul className="space-y-3">
                {userData.enrolled_courses.map(course => (
                  <li key={course._id} className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                    <Link to={`/courses/${course._id}`} className="font-semibold text-blue-700 block truncate">
                      {course.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link to="/courses" className="mt-6 text-center w-full bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition font-medium">Browse Courses</Link>
        </div>

        {/* Applied Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Briefcase className="text-blue-600" />
            <h3 className="text-xl font-bold">Applied Jobs</h3>
          </div>
          <div className="flex-grow">
            {userData.applied_jobs.length === 0 ? (
              <p className="text-gray-500 italic">You haven't applied to any jobs yet.</p>
            ) : (
              <ul className="space-y-3">
                {userData.applied_jobs.map(job => (
                  <li key={job._id} className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                    <div className="font-semibold text-blue-700 truncate">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.company}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link to="/jobs" className="mt-6 text-center w-full bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition font-medium">Find Jobs</Link>
        </div>

        {/* Certificates & Quizzes */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full lg:col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Award className="text-green-600" />
            <h3 className="text-xl font-bold">Achievements</h3>
          </div>
          <div className="flex-grow space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Certificates</h4>
              {userData.certificates.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No certificates earned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {userData.certificates.map(cert => (
                    <li key={cert._id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                      <span className="truncate flex-1">{cert.course_name}</span>
                      <a href={`http://localhost:8000/certificate/download/${cert._id}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs ml-2">Download</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Quiz Scores</h4>
              {Object.keys(userData.quiz_scores).length === 0 ? (
                <p className="text-gray-500 italic text-sm">No quizzes taken yet.</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(userData.quiz_scores).map(([quizId, scoreData]) => (
                    <li key={quizId} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                      <span className="truncate text-gray-600">Quiz ID: {quizId.substring(0, 8)}...</span>
                      <span className="font-bold">{scoreData.score}/{scoreData.total}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
