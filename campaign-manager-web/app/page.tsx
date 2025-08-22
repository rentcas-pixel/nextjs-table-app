'use client'

import { useState } from 'react'

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Viršutinė dalis su filtrais ir info įvedimu */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Kampanijų valdymas</h1>
            <div className="flex gap-2">
              <button 
                onClick={toggleForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {isFormOpen ? 'Uždaryti formą' : '+ Pridėti kampaniją'}
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
                Atnaujinti
              </button>
            </div>
          </div>

          {/* Filtrai ir paieška */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Ieškoti pagal klientą..." 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Visi statusai</option>
              <option value="true">Patvirtinta</option>
              <option value="false">Nepatvirtinta</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Visi tipai</option>
              <option value="true">Viadukas</option>
              <option value="false">Ne viadukas</option>
            </select>
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Suskleidžiama info įvedimo forma */}
          {isFormOpen && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Nauja kampanija</h2>
                <button 
                  onClick={toggleForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Klientas" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="text" 
                  placeholder="Agentūra" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Patvirtinta</option>
                  <option value="true">Taip</option>
                  <option value="false">Ne</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Viadukas</option>
                  <option value="true">Taip</option>
                  <option value="false">Ne</option>
                </select>
                <input 
                  type="date" 
                  placeholder="Data nuo" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="date" 
                  placeholder="Data iki" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Media gauta</option>
                  <option value="true">Taip</option>
                  <option value="false">Ne</option>
                </select>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Kaina" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Sąskaita išsiųsta</option>
                  <option value="true">Taip</option>
                  <option value="false">Ne</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Dažnis" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input 
                  type="number" 
                  placeholder="Sąskaitos ID" 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                  Išsaugoti
                </button>
                <button 
                  onClick={toggleForm}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  Atšaukti
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lentelė su duomenimis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Kampanijos</h2>
            <span className="text-sm text-gray-500">Iš viso: 2</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Klientas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Agentūra</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Patvirtinta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Viadukas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Data nuo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Data iki</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Media gauta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Kaina</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Sąskaita išsiųsta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Dažnis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Sąskaitos ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Veiksmai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">Eurojackpot 08.18-08.22</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Open</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Taip</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Ne</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">2025-08-18</td>
                  <td className="px-4 py-3 text-sm text-gray-900">2025-08-25</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Taip</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">€1253.40</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Ne</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">1</td>
                  <td className="px-4 py-3 text-sm text-gray-900">3526</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Redaguoti
                      </button>
                      <button className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        Ištrinti
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">Eurovaistinė</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Mindshare</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Taip</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Ne</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">2025-09-04</td>
                  <td className="px-4 py-3 text-sm text-gray-900">2025-09-08</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Ne</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">€2642.54</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Ne</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">1</td>
                  <td className="px-4 py-3 text-sm text-gray-900">3520</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Redaguoti
                      </button>
                      <button className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        Ištrinti
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}

