"use client";

import { Tabs } from "@/components/ui/tabs";

export function DashboardPreview() {
  const renderMockup = (title: string, color: string) => (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="mx-auto bg-white border border-gray-200 rounded-md py-1 px-4 text-xs text-gray-400 font-medium flex items-center justify-center w-1/3 min-w-[200px]">
          nusaartha.com/app/{title.toLowerCase().replace(' ', '-')}
        </div>
      </div>
      
      {/* Mockup Body */}
      <div className="p-6 md:p-8 bg-gray-50 flex-1 min-h-[400px] flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-48 shrink-0 gap-2">
          <div className={`h-8 rounded-md mb-4 ${color}`} />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-full mt-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Topbar */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-1/3 h-6 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100 h-24 shadow-sm flex flex-col justify-between">
              <div className="w-1/2 h-3 bg-gray-100 rounded" />
              <div className="w-3/4 h-6 bg-gray-200 rounded" />
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100 h-24 shadow-sm flex flex-col justify-between">
              <div className="w-1/2 h-3 bg-gray-100 rounded" />
              <div className="w-2/3 h-6 bg-gray-200 rounded" />
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100 h-24 shadow-sm flex flex-col justify-between hidden md:flex">
              <div className="w-1/2 h-3 bg-gray-100 rounded" />
              <div className="w-4/5 h-6 bg-gray-200 rounded" />
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100 h-24 shadow-sm flex flex-col justify-between hidden md:flex">
              <div className="w-1/2 h-3 bg-gray-100 rounded" />
              <div className="w-1/2 h-6 bg-gray-200 rounded" />
            </div>
          </div>
          
          {/* Chart / Table Area */}
          <div className="flex-1 bg-white border border-gray-100 rounded-lg shadow-sm p-4 mt-2">
            <div className="w-1/4 h-4 bg-gray-200 rounded mb-6" />
            <div className="flex items-end gap-2 h-40">
              {[40, 60, 30, 80, 50, 90, 70, 100].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${color} opacity-80`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-950 mb-4">
            Kontrol Penuh dalam Genggaman
          </h2>
          <p className="text-lg text-gray-500 text-balance">
            Dashboard intuitif yang disesuaikan dengan peran Anda dalam ekosistem.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs
            defaultValue="brand"
            tabs={[
              {
                id: "brand",
                label: "Brand Dashboard",
                content: renderMockup("Brand Owner", "bg-green-500"),
              },
              {
                id: "investor",
                label: "Investor Dashboard",
                content: renderMockup("Investor", "bg-blue-500"),
              },
              {
                id: "operator",
                label: "Operator Dashboard",
                content: renderMockup("Operator", "bg-orange-500"),
              },
              {
                id: "admin",
                label: "Admin Dashboard",
                content: renderMockup("Administrator", "bg-purple-500"),
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
