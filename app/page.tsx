import ResourceTable from '../components/resource-table'

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[95rem] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Viadukų užimtumas</h1>
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain shrink-0" />
        </div>
        <ResourceTable />
      </div>
    </main>
  )
}
