"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import DymaxionMap from "../../../components/dymaxion-map"  // ← replaced component

export default function CultureFullAreaPage() {
  const [time, setTime] = useState(2025)

  return (
    <div className="p-8 text-white space-y-10">
      <header>
        <h1 className="text-4xl font-bold mb-2">
          Culture — Full System View
        </h1>
        <p className="text-gray-300">
          A living snapshot of humanity’s cultural spectrum.
        </p>
      </header>

      {/* DYMAXION MAP */}
      <section className="w-full h-[450px] bg-zinc-900/40 rounded-xl border border-white/10 overflow-hidden">
        <DymaxionMap />   {/* ← replaced the icosahedron spin */}
      </section>

      {/* HUMANITY'S PALETTE */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Humanity’s Palette</h2>

        {/* TIME CONTROL */}
        <div className="flex items-center space-x-4">
          <label className="text-gray-400">Year</label>
          <input
            type="range"
            min="1800"
            max="2025"
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-gray-200 font-medium">{time}</span>
        </div>

        {/* GRID OF CULTURAL GROUPINGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Religions */}
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-white/10">
            <h3 className="font-semibold mb-3 text-lg">Religions</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>Christianity</li>
              <li>Islam</li>
              <li>Hinduism</li>
              <li>Buddhism</li>
              <li>Sikhism</li>
              <li>Judaism</li>
              <li>Folk / Indigenous</li>
              <li>Non-religious / Secular</li>
            </ul>
          </div>

          {/* Countries */}
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-white/10">
            <h3 className="font-semibold mb-3 text-lg">Countries</h3>
            <p className="text-gray-400 text-sm mb-2">UN recognized list...</p>
            <div className="grid grid-cols-3 gap-1 text-gray-300 text-xs">
              {["China","India","US","Indonesia","Pakistan","Brazil","Nigeria","Bangladesh","Russia","Mexico"].map((c) => (
                <span key={c} className="bg-zinc-800/40 px-2 py-1 rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-zinc-900/30 rounded-xl p-5 border border-white/10">
            <h3 className="font-semibold mb-3 text-lg">Languages</h3>
            <p className="text-gray-400 text-sm mb-2">Top language families...</p>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>Indo-European</li>
              <li>Sino-Tibetan</li>
              <li>Afro-Asiatic</li>
              <li>Niger-Congo</li>
              <li>Austronesian</li>
              <li>Turkic</li>
              <li>Dravidian</li>
              <li>Uralic</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  )
}
