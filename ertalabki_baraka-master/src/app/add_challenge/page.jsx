"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Plus, ArrowLeft, Flame, X } from "lucide-react"

export default function ChallengeSelectionPage() {
  const router = useRouter()
  const [telegramId, setTelegramId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [availableTasks, setAvailableTasks] = useState([])
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.expand()
        tg.ready()

        const user = tg.initDataUnsafe?.user
        if (user?.id) {
          setTelegramId(user.id.toString())
        } else {
          setError("User data not available")
          setLoading(false)
        }
      } else {
        setError("Please open in Telegram app")
        setLoading(false)
      }
    }

    if (!window.Telegram) {
      const script = document.createElement("script")
      script.src = "https://telegram.org/js/telegram-web-app.js"
      script.async = true
      script.onload = initTelegram
      document.body.appendChild(script)
    } else {
      initTelegram()
    }
  }, [])

  // Fetch task selection status when telegramId is available
  useEffect(() => {
    if (!telegramId) return

    const fetchTaskSelection = async () => {
      try {
        const response = await fetch(
          `https://baraka30.pythonanywhere.com/api/user-task-selection/?telegram_id=${telegramId}`,
        )

        if (!response.ok) {
          const errorData = await response.text()
          console.error("API Error:", errorData)
          throw new Error("Failed to fetch tasks")
        }

        const data = await response.json()

        const cleanTasks = (tasks) =>
          tasks.map((task) => ({
            ...task,
            title: task.title.replace(/^✅\s*/, ""),
          }))

        setSelectedTasks(cleanTasks(data.selected || []))
        setAvailableTasks(cleanTasks(data.unselected || []))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTaskSelection()
  }, [telegramId])

  const toggleTaskSelection = (task, isSelected) => {
    if (isSelected) {
      setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id))
      setAvailableTasks((prev) => [...prev, task])
    } else {
      setSelectedTasks((prev) => [...prev, task])
      setAvailableTasks((prev) => prev.filter((t) => t.id !== task.id))
    }
  }

  const updateTaskSelection = async () => {
    if (!telegramId) {
      setError("User not authenticated")
      return
    }

    if (selectedTasks.length === 0) {
      setError("Please select at least one challenge")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        telegram_id: Number(telegramId),
        task_ids: selectedTasks.map((task) => task.id),
      }

      const response = await fetch("https://baraka30.pythonanywhere.com/api/update_user_task_selection/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned unexpected response")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update selection")
      }

      router.push("/")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save selection"
      setError(errorMessage)
      console.error("Update error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeRange = (start, end) => {
    const format = (timeStr) => {
      const [hours, minutes] = timeStr.split(":")
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
    }
    return `${format(start)} - ${format(end)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/50 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push("/")} className="p-2 rounded-full hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Tanlash</h1>
          <div className="w-8"></div>
        </div>

        {error && (
          <div className="bg-red-900/50 p-3 rounded-lg mb-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Tanlanganlar ({selectedTasks.length})
          </h2>
          {selectedTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">Hali hech narsa tanlanmagan</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <div
                  key={`selected-${task.id}`}
                  className="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">{formatTimeRange(task.time_start, task.time_end)}</p>
                      <span className="text-xs flex items-center text-red-400">
                        <Flame className="h-3 w-3 mr-1" /> {task.point}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTaskSelection(task, true)}
                    className="p-2 text-red-500 hover:bg-red-900/30 rounded-full ml-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Boshqa chellenjlar
          </h2>
          {availableTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">Barcha chellenjlar tanlangan</p>
          ) : (
            <div className="space-y-2">
              {availableTasks.map((task) => (
                <div
                  key={`available-${task.id}`}
                  onClick={() => toggleTaskSelection(task, false)}
                  className="bg-gray-900 hover:bg-gray-800 rounded-lg p-3 cursor-pointer"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-400 mb-1">{task.description}</p>}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">{formatTimeRange(task.time_start, task.time_end)}</p>
                    <span className="text-xs flex items-center text-red-400">
                      <Flame className="h-3 w-3 mr-1" /> {task.point}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={updateTaskSelection}
          disabled={selectedTasks.length === 0 || isSubmitting}
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md py-3 rounded-lg font-medium ${
            selectedTasks.length === 0 || isSubmitting
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  )
}
