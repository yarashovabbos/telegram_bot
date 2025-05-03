"use client"

import { useState, useEffect, useRef } from "react"
import { format, isSameMonth, isSameDay, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"
import Navbar from "../components/navbar"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [taskLogs, setTaskLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [userTasks, setUserTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [telegramId, setTelegramId] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Initialize Telegram WebApp and get user info
  useEffect(() => {
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.expand()
        tg.ready()

        const user = tg.initDataUnsafe?.user
        if (user?.id) {
          setTelegramId(user.id.toString())
        }
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch user tasks when telegramId is available
  useEffect(() => {
    if (!telegramId) return

    const fetchUserTasks = async () => {
      try {
        const response = await fetch(`https://baraka30.pythonanywhere.com/api/user-tasks/?telegram_id=${telegramId}`)
        const data = await response.json()
        if (data.tasks) {
          setUserTasks(data.tasks)
          if (data.tasks.length > 0) {
            setSelectedTask(data.tasks[0])
          }
        }
      } catch (error) {
        console.error("Error fetching user tasks:", error)
      }
    }

    fetchUserTasks()
  }, [telegramId])

  // Fetch task logs when task is selected
  useEffect(() => {
    if (!telegramId || !selectedTask) return

    const fetchTaskLogs = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `https://baraka30.pythonanywhere.com/api/calendar/?telegram_id=${telegramId}&task_id=${selectedTask.id}`,
        )
        const data = await response.json()
        setTaskLogs(data)
      } catch (error) {
        console.error("Error fetching task logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTaskLogs()
  }, [telegramId, selectedTask])

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = []
    let currentDay = new Date(startDate)

    while (currentDay <= endDate) {
      const date = new Date(currentDay)
      const dayKey = format(date, "yyyy-MM-dd")
      const isCurrentMonth = isSameMonth(date, monthStart)
      const isSelected = isSameDay(date, selectedDate)
      const status = taskLogs[dayKey]

      days.push(
        <div
          key={date.toString()}
          className={`h-10 w-10 flex flex-col items-center justify-center p-0.5 m-0.5 rounded-lg cursor-pointer transition-all duration-200 ${
            !isCurrentMonth ? "text-gray-600" : "text-white"
          } ${isSelected ? "bg-red-600 border border-white" : "bg-gray-800 hover:bg-gray-700"}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">{format(date, "d")}</span>
            {status && (
              <div className="mt-0.5">
                {status === "done" ? (
                  <Check className="text-green-400 h-2.5 w-2.5" />
                ) : (
                  <X className="text-red-400 h-2.5 w-2.5" />
                )}
              </div>
            )}
          </div>
        </div>,
      )

      currentDay = addDays(currentDay, 1)
    }

    // Split days into weeks
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
        <div className="grid grid-cols-7 gap-0.5" key={`week-${i}`}>
          {days.slice(i, i + 7)}
        </div>,
      )
    }

    return weeks
  }

  const handleDateClick = (date) => {
    const newDate = new Date(date)
    setSelectedDate(newDate)
  }

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentDate(newDate)
  }

  if (loading && !selectedTask) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!selectedTask) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>No tasks available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-red-500">•</span> Kalendar
          </h1>

          {/* Task selector dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex border-none rounded-xl bg-gray-800 items-center p-2 gap-2 cursor-pointer hover:bg-gray-700"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="truncate max-w-[100px] text-sm">{selectedTask?.title || "Select Task"}</span>
              {dropdownOpen ? <IoIosArrowUp size={14} /> : <IoIosArrowDown size={14} />}
            </div>
            {dropdownOpen && userTasks.length > 0 && (
              <div className="absolute right-0 mt-1 w-full bg-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {userTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 hover:bg-gray-700 cursor-pointer truncate text-sm"
                    onClick={() => {
                      setSelectedTask(task)
                      setDropdownOpen(false)
                    }}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-800 transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-800 transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-gray-400 mb-1 text-xs">
          {["Yak", "Du", "Se", "Chor", "Pay", "Ju", "Sha"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="mb-4">{renderCalendar()}</div>

        {/* Selected date info */}
        <div className="bg-gray-900 rounded-xl p-3">
          <h3 className="text-md font-semibold mb-2">{format(selectedDate, "MMMM d, yyyy")}</h3>

          {/* Task status for selected date */}
          <div className="bg-gray-800 p-2 rounded-lg">
            <p className="font-medium text-sm">{selectedTask?.title}</p>
            <p className="text-xs text-gray-400 mt-1">{selectedTask?.description}</p>
            <div className="mt-2 flex items-center gap-2">
              {taskLogs[format(selectedDate, "yyyy-MM-dd")] ? (
                <>
                  {taskLogs[format(selectedDate, "yyyy-MM-dd")] === "done" ? (
                    <Check className="text-green-400 h-3 w-3" />
                  ) : (
                    <X className="text-red-400 h-3 w-3" />
                  )}
                  <span
                    className={`text-xs ${
                      taskLogs[format(selectedDate, "yyyy-MM-dd")] === "done" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {taskLogs[format(selectedDate, "yyyy-MM-dd")] === "done" ? "Bajarildi" : "O'tkazib yuborildi"}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-gray-400 text-xs">Bu kun uchun topshiriq yo&lsquo;q</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  )
}
