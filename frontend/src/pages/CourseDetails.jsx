import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get('/courses');
        const found = response.data.find(c => c._id === id);
        if (found) {
          setCourse(found);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      alert('Successfully enrolled!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 h-32 flex items-center px-8">
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
        </div>
        <div className="p-8">
          <h3 className="text-xl font-semibold mb-4">About this course</h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-8 leading-relaxed">
            {course.description}
          </p>

          {course.video_link && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Video Link</h3>
              <a href={course.video_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {course.video_link}
              </a>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
            <button
              onClick={() => navigate(`/quiz/${id}`)}
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded font-semibold hover:bg-blue-50 transition"
            >
              Take Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
