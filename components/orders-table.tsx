'use client'
import React, { useState } from 'react'

// Paprastas Order tipas be PocketBase
interface Order {
  id: string
  client: string
  agency: string
  approved: boolean
  type: string
  from: string
  to: string
  media_received: boolean
  price: number
  invoice_id: string
  invoice_sent: boolean
}

export default function OrdersTable() {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      client: 'Test Klientas',
      agency: 'Test Agentūra',
      approved: true,
      type: 'Video',
      from: '2024-01-01',
      to: '2024-01-31',
      media_received: true,
      price: 1000,
      invoice_id: 'INV-001',
      invoice_sent: false
    }
  ])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Kampanijų valdymas</h1>
        <p className="text-gray-600">Test versija - PocketBase jungtis vėliau</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Klientas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Agentūra</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Patvirtinta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Tipas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Nuo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Iki</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Media gauta</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Kaina</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Sąskaitos ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Sąskaita išsiųsta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{order.client}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.agency}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded text-xs ${order.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.approved ? 'Taip' : 'Ne'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.type}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.from}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.to}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded text-xs ${order.media_received ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.media_received ? 'Taip' : 'Ne'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">€{order.price}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.invoice_id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded text-xs ${order.invoice_sent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.invoice_sent ? 'Taip' : 'Ne'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <strong>Test versija sėkmingai veikia!</strong> Server'is paleistas ir komponentas rodomas.
        </p>
      </div>
    </div>
  )
}
