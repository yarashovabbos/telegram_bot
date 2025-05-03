"use client"

import { useState, useEffect } from "react"
import { FaFire, FaTrophy, FaClock, FaCheck, FaTimes } from "react-icons/fa"
import { IoIosClose } from "react-icons/io"
import { useRouter } from "next/navigation"
import Navbar from "./components/navbar"
import Link from "next/link"

export default function ChallengePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentTime, setCurrentTime] = useState("")

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const fetchUserTasks = async (telegramId) => {
    try {
      const response = await fetch(`https://baraka30.pythonanywhere.com/api/user-tasks/?telegram_id=${telegramId}`)
      const data = await response.json()
      if (data.tasks) {
        setChallenges(data.tasks)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const checkUserExists = async (telegramId) => {
    try {
      const response = await fetch(`https://baraka30.pythonanywhere.com/api/check-user/?telegram_id=${telegramId}`)
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error("Error checking user:", error)
      return false
    }
  }

  const completeTask = async (taskId, status) => {
    if (!user?.telegram_id) return

    try {
      const response = await fetch("https://baraka30.pythonanywhere.com/api/complete-task/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegram_id: user.telegram_id,
          task_id: taskId,
          status: status,
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  useEffect(() => {
    const initTelegram = async () => {
      const tg = window.Telegram?.WebApp

      if (!tg) {
        setAuthError("Please open in Telegram app")
        setLoading(false)
        return
      }

      tg.expand()
      tg.ready()

      const userData = tg.initDataUnsafe?.user
      if (userData) {
        const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
        const userInfo = {
          id: userData.id,
          username: userData.username,
          full_name: fullName || userData.username || `User #${userData.id}`,
          telegram_id: userData.id.toString(),
        }
        setUser(userInfo)

        const userExists = await checkUserExists(userData.id)
        if (!userExists) {
          router.push("/starttask/")
          return
        }

        await fetchUserTasks(userInfo.telegram_id)
      } else {
        setAuthError("User data not available")
      }

      setLoading(false)
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
  }, [router])

  const isTaskTimeValid = (startTime, endTime) => {
    if (!currentTime) return false

    const [currentHours, currentMinutes] = currentTime.split(":").map(Number)
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    const currentTotal = currentHours * 60 + currentMinutes
    const startTotal = startHours * 60 + startMinutes
    const endTotal = endHours * 60 + endMinutes

    return currentTotal >= startTotal && currentTotal <= endTotal
  }

  const handleTaskClick = (task) => {
    if (task.status === "unchanged") {
      if (isTaskTimeValid(task.time_start, task.time_end)) {
        setSelectedTask(task)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "bg-green-500"
      case "missed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return "✓"
      case "missed":
        return "✗"
      default:
        return "○"
    }
  }

  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`)
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getTaskStatusText = (task) => {
    if (task.status !== "unchanged") return null

    const isActive = isTaskTimeValid(task.time_start, task.time_end)
    if (!isActive) {
      const now = new Date()
      const [endHours, endMinutes] = task.time_end.split(":").map(Number)
      const endTime = new Date(now)
      endTime.setHours(endHours, endMinutes, 0, 0)

      return now > endTime ? "Vaqti o'tib ketgan" : "Hali boshlanmagan"
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-900/50 p-6 rounded-xl max-w-md">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">{authError}</p>
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
    <div className="bg-black min-h-screen text-white flex flex-col gap-1">
      <div className="container mx-auto p-4 mb-14">
        <header className="bg-gradient-to-r from-black via-gray-900 to-red-900 p-4 rounded-xl mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaTrophy className="text-red-500 text-2xl" />
            <div>
              <h1 className="text-xl font-bold">Kunlik chellenjlar</h1>
              {user && <p className="text-sm text-gray-300">{user.full_name}</p>}
            </div>
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Mening chellenjlarim</h2>
          <Link href={"/add_challenge"}>+</Link>
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const isClickable =
                challenge.status === "unchanged" && isTaskTimeValid(challenge.time_start, challenge.time_end)
              const statusText = getTaskStatusText(challenge)

              return (
                <div
                  key={challenge.id}
                  onClick={() => isClickable && handleTaskClick(challenge)}
                  className={`p-4 rounded-xl flex justify-between items-center ${
                    isClickable ? "cursor-pointer hover:bg-gray-800" : "cursor-default"
                  } transition-colors ${
                    challenge.status !== "unchanged" ? "opacity-75" : ""
                  } ${getStatusColor(challenge.status)} bg-opacity-10 relative`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(challenge.status)}`}>
                      {getStatusIcon(challenge.status)}
                    </div>
                    <div>
                      <p className="text-lg">{challenge.title}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <FaClock size={12} />
                        {formatTime(challenge.time_start)} - {formatTime(challenge.time_end)}
                      </p>
                      {statusText && <p className="text-xs text-red-400 mt-1">{statusText}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 flex items-center gap-1">
                      <FaFire /> {challenge.point}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task Completion Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-red-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Chellenjni bajarish</h3>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">
                  <IoIosClose size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold">{selectedTask.title}</h4>
                <p className="text-gray-400 mt-1">{selectedTask.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-gray-300">
                    <FaClock className="inline mr-1" />
                    {formatTime(selectedTask.time_start)} - {formatTime(selectedTask.time_end)}
                  </span>
                  <span className="text-sm text-red-400">
                    <FaFire className="inline mr-1" />
                    {selectedTask.point} ball
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => completeTask(selectedTask.id, "missed")}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaTimes /> Bajarilmadi
                </button>
                <button
                  onClick={() => completeTask(selectedTask.id, "done")}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaCheck /> Bajarildi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        <Navbar />
      </div>
    </div>
  )
}
