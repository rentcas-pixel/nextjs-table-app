import ResourceTable from '../components/resource-table'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>
        <ResourceTable />
      </div>
    </main>
  )
}
