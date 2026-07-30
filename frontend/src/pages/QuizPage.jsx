import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { FileText, Award } from 'lucide-react';

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quiz/${courseId}`);
        setQuizzes(response.data);
        if (response.data.length > 0) {
          setCurrentQuiz(response.data[0]); // Take first quiz for simplicity
        }
      } catch (err) {
        setError('Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId]);

  const handleOptionChange = (qIndex, oIndex) => {
    setAnswers({ ...answers, [qIndex]: oIndex });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuiz) return;

    // Prepare answers array based on question order
    const submissionAnswers = currentQuiz.questions.map((_, index) => answers[index] !== undefined ? answers[index] : -1);

    try {
      const response = await api.post(`/quiz/${currentQuiz._id}/submit`, { answers: submissionAnswers });
      setResult(response.data);
    } catch (err) {
      alert('Failed to submit quiz. Please ensure you are logged in and enrolled.');
    }
  };

  const handleGetCertificate = async () => {
    setGeneratingCert(true);
    try {
      const response = await api.post(`/certificate/generate/${courseId}`);
      const certId = response.data.certificate_id;
      window.open(`http://localhost:8000/certificate/download/${certId}`, '_blank');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading quiz...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  if (quizzes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">No quizzes available for this course yet.</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <FileText size={32} className="text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Course Quiz</h2>
        </div>

        {result ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
            <p className="text-xl mb-6">
              You scored <span className="font-bold text-blue-600">{result.score}</span> out of {result.total}.
            </p>
            {result.score > 0 && (
              <button
                onClick={handleGetCertificate}
                disabled={generatingCert}
                className="flex items-center justify-center gap-2 mx-auto bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                <Award size={24} />
                {generatingCert ? 'Generating...' : 'Get Certificate'}
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-gray-600 hover:underline block mx-auto">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {currentQuiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-8">
                <h4 className="text-lg font-semibold mb-3">{qIndex + 1}. {q.question_text}</h4>
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        className="mr-3 h-4 w-4 text-blue-600"
                        checked={answers[qIndex] === oIndex}
                        onChange={() => handleOptionChange(qIndex, oIndex)}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
              Submit Quiz
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
