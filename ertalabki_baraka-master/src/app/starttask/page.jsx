'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaFire, FaArrowRight, FaClock } from 'react-icons/fa';

// interface ChallengeTask {
//   id: number;
//   title: string;
//   description: string;
//   time_start: string;
//   time_end: string;
//   point: number;
// }

export default function StartTaskPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ChallengeTask>([]);
  const [selectedTasks, setSelectedTasks] = useState<number>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Initialize Telegram WebApp and get user info
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.expand();
        tg.ready();
        
        const user = tg.initDataUnsafe?.user;
        if (user?.id) {
          setTelegramId(user.id.toString());
          // Get user's real name
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          setUserName(fullName || user.username || `User_${user.id}`);
        }
      }
    };

    if (!window.Telegram) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = initTelegram;
      document.body.appendChild(script);
    } else {
      initTelegram();
    }

    // Fetch all tasks
    fetch('https://baraka30.pythonanywhere.com/api/all-tasks/')
      .then(response => response.json())
      .then(data => {
        if (data.available_tasks) {
          setTasks(data.available_tasks);
        } else {
          throw new Error('Invalid tasks data format');
        }
      })
      .catch(err => {
        console.error('Error fetching tasks:', err);
        setError('Failed to load challenges. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSubmit = async () => {
    if (!telegramId) {
      setError('Telegram ID not available');
      return;
    }

    if (selectedTasks.length === 0) {
      setError('Please select at least one challenge');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First create the user with real name
      const createUserResponse = await fetch('https://baraka30.pythonanywhere.com/api/create-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          name: userName
        })
      });

      if (!createUserResponse.ok) {
        throw new Error('Failed to create user');
      }

      // Then select tasks
      const selectTasksResponse = await fetch('https://baraka30.pythonanywhere.com/api/select-tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramId,
          task_ids: selectedTasks
        })
      });

      if (!selectTasksResponse.ok) {
        throw new Error('Failed to select tasks');
      }

      // Redirect to main page on success
      router.push('/');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to save your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-900/50 p-6 rounded-xl max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Qaytadan urining
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto p-4 pb-24">
        <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 p-4 rounded-xl mb-6">
          <h1 className="text-2xl font-bold">CHellenjlarni tanlang</h1>
          <p className="text-gray-300 mt-2">Boshlash uchun chellenj tanlang</p>
        </header>

        <div className="space-y-4 mb-12">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border ${selectedTasks.includes(task.id) ? 'border-red-500 bg-gray-900' : 'border-gray-800 bg-gray-900/50'}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTaskSelection(task.id)}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded flex items-center justify-center 
                    ${selectedTasks.includes(task.id) ? 'bg-red-500' : 
                      selectedTasks.length >= 0 ? 'bg-gray-700' : 'border border-gray-600'}`}
                >
                  {selectedTasks.includes(task.id) && <FaCheck className="text-white" />}
                </button>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{task.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <FaClock size={12} />
                      <span>{task.time_start} - {task.time_end}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-red-400">
                      <FaFire size={12} />
                      <span>{task.point} ball</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-20 left-0 right-0 px-4">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white bg-red-600" 
          >
            {loading ? (
              'Saqlanmoqda...'
            ) : (
              <>
                <span>Saqlash</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}