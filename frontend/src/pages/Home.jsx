import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-6">Welcome to EDUTRACK</h1>
        <p className="text-lg text-gray-700 mb-8">
          The all-in-one platform to learn new skills, take quizzes to test your knowledge, earn certificates, and apply for your dream jobs.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Explore Courses
          </Link>
          <Link to="/jobs" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            Find Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
