"use client"

import { useEffect, useState } from "react"
import { Trophy, Activity, BarChart2, Calendar } from "lucide-react"
import { FaFire, FaMedal } from "react-icons/fa"
import Navbar from "../components/navbar"

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [telegramId, setTelegramId] = useState(null)
  let script = null

  useEffect(() => {
    const initTelegram = () => {
      try {
        const tg = window.Telegram?.WebApp

        if (!tg) return

        tg.expand()
        tg.ready()

        const userData = tg.initDataUnsafe?.user
        if (userData?.id) {
          setTelegramId(userData.id.toString())
        }
      } catch (error) {
        console.error("Error initializing Telegram WebApp:", error)
      }
    }

    if (!window.Telegram) {
      script = document.createElement("script")
      script.src = "https://telegram.org/js/telegram-web-app.js"
      script.async = true
      script.onload = initTelegram
      document.body.appendChild(script)
    } else {
      initTelegram()
    }

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!telegramId) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch user profile
        const profileResponse = await fetch(
          `https://baraka30.pythonanywhere.com/api/profile/?telegram_id=${telegramId}`,
        )
        const profileData = await profileResponse.json()
        if (!profileResponse.ok) {
          console.error("Profile API error:", profileData)
          throw new Error("Failed to fetch profile data")
        }
        setUserProfile(profileData)

        // Fetch progress data
        const progressResponse = await fetch(
          `https://baraka30.pythonanywhere.com/api/user-progress/?telegram_id=${telegramId}`,
        )
        const progressData = await progressResponse.json()
        if (!progressResponse.ok) {
          console.error("Progress API error:", progressData)
          throw new Error("Failed to fetch progress data")
        }
        setProgressData(progressData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [telegramId])

  const renderProgressChart = () => {
    if (!progressData) return null

    return (
      <div className="bg-[#1E1E1E] rounded-xl p-4 mb-6">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
          <BarChart2 className="text-blue-400" size={20} />
          Kunlik topshiriqlar
        </h2>

        {Object.entries(progressData).map(([dayKey, dayData]) => (
          <div key={dayKey} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-400" size={16} />
                <span className="text-gray-300 text-sm">
                  {new Date(dayData.date).toLocaleDateString("uz", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  dayData.status === "done" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                }`}
              >
                {dayData.status === "done" ? "Bajarilgan" : "Bajarilmagan"}
              </span>
            </div>

            <div className="space-y-2">
              {dayData.done.map((task, index) => (
                <div key={`done-${index}`} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-gray-300 text-sm">{task}</span>
                </div>
              ))}

              {dayData.missed.map((task, index) => (
                <div key={`missed-${index}`} className="flex items-start gap-2 opacity-60">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span className="text-gray-400 text-sm">{task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Profil ma'lumotlarini topishda xatolik!</p>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="px-4 pt-6 pb-20">
        {/* Profile */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-full w-14 h-14 flex items-center justify-center text-white font-bold text-xl">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">{userProfile.name}</h1>
              <p className="text-gray-400 text-sm">{userProfile.participate_days}kun ishtirok etilgan</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-gray-900 rounded-lg p-2 text-center">
              <FaFire className="text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Vazifalar bajarilgan</p>
              <p className="text-sm font-semibold">{userProfile.participate_days} kun</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-2 text-center">
              <Trophy className="text-yellow-400 mx-auto mb-1" size={18} />
              <p className="text-xs text-gray-400">
                Reytingdagi <br /> o'rin
              </p>
              <p className="text-sm font-semibold">#{userProfile.rank}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-2 text-center">
              <FaMedal className="text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">To'plangan ballar</p>
              <p className="text-sm font-semibold">{userProfile.points}</p>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        {renderProgressChart()}

        {/* Activity Stats */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 mb-6">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
            <Activity className="text-red-400" size={20} />
            Aktivlik statistikasi
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Umumiy ishtirok etgan</span>
              <span className="text-white font-medium">{userProfile.participate_days} kun</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Hozirgi o'rin</span>
              <span className="text-white font-medium">#{userProfile.rank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">To'plangan ballar</span>
              <span className="text-white font-medium">{userProfile.points}</span>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <Navbar />
      </div>
    </div>
  )
}

export default ProfilePage
