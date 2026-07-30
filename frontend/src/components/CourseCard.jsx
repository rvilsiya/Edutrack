import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-40 bg-blue-100 flex items-center justify-center">
        <BookOpen size={48} className="text-blue-500" />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 truncate">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        <Link
          to={`/courses/${course._id}`}
          className="inline-block w-full text-center bg-blue-50 text-blue-600 font-semibold py-2 rounded hover:bg-blue-100 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
