import PocketBase from 'pocketbase'

// PocketBase klientas su realaus laiko funkcionalumu
export const pb = new PocketBase('https://get.piksel.lt')

// Orders kolekcijos tipai
export interface Order {
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
  created: string
  updated: string
}

// Realaus laiko atnaujinimai
export const subscribeToOrders = (callback: (data: any) => void) => {
  return pb.collection('orders').subscribe('*', callback)
}

// CRUD operacijos
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const records = await pb.collection('orders').getFullList()
    return records.map(record => ({
      id: record.id,
      client: record.client || '',
      agency: record.agency || '',
      approved: record.approved || false,
      type: record.type || '',
      from: record.from || '',
      to: record.to || '',
      media_received: record.media_received || false,
      price: record.price || 0,
      invoice_id: record.invoice_id || '',
      invoice_sent: record.invoice_sent || false,
      created: record.created || '',
      updated: record.updated || ''
    }))
  } catch (error) {
    console.error('Klaida gaunant orders:', error)
    return []
  }
}

export const createOrder = async (order: Omit<Order, 'id' | 'created' | 'updated'>): Promise<Order> => {
  try {
    const record = await pb.collection('orders').create(order)
    return {
      id: record.id,
      client: record.client || '',
      agency: record.agency || '',
      approved: record.approved || false,
      type: record.type || '',
      from: record.from || '',
      to: record.to || '',
      media_received: record.media_received || false,
      price: record.price || 0,
      invoice_id: record.invoice_id || '',
      invoice_sent: record.invoice_sent || false,
      created: record.created || '',
      updated: record.updated || ''
    }
  } catch (error) {
    console.error('Klaida kuriant order:', error)
    throw error
  }
}

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
  try {
    const record = await pb.collection('orders').update(id, updates)
    return {
      id: record.id,
      client: record.client || '',
      agency: record.agency || '',
      approved: record.approved || false,
      type: record.type || '',
      from: record.from || '',
      to: record.to || '',
      media_received: record.media_received || false,
      price: record.price || 0,
      invoice_id: record.invoice_id || '',
      invoice_sent: record.invoice_sent || false,
      created: record.created || '',
      updated: record.updated || ''
    }
  } catch (error) {
    console.error('Klaida atnaujinant order:', error)
    throw error
  }
}

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await pb.collection('orders').delete(id)
  } catch (error) {
    console.error('Klaida trinant order:', error)
    throw error
  }
}
