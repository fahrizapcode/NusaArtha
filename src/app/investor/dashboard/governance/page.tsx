"use client";

import { Button } from "@/components/ui/button";
import { Vote, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const VOTING_DATA = [
  {
    id: 1,
    title: "Persetujuan Penggunaan Dana Cadangan (Capex)",
    desc: "Outlet BSD City membutuhkan penggantian mesin espresso utama karena kerusakan yang tidak tercover garansi. Dana akan diambil dari pencadangan sinking fund.",
    deadline: "20 Juli 2026",
    progress: 75,
    status: "Aktif",
    voted: null
  },
  {
    id: 2,
    title: "Perpanjangan Kontrak Sewa Ruko",
    desc: "Sewa ruko Outlet Cihampelas akan habis 3 bulan lagi. Pemilik ruko menaikkan harga sewa 5%. Apakah setuju untuk perpanjang atau relokasi?",
    deadline: "10 Juni 2026",
    progress: 100,
    status: "Selesai",
    voted: "setuju"
  }
];

export default function GovernancePage() {
  const [votings, setVotings] = useState(VOTING_DATA);

  const handleVote = (id: number, choice: "setuju" | "tidak") => {
    setVotings(prev => prev.map(v => v.id === id ? { ...v, voted: choice } : v));
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Governance</h1>
        <p className="text-sm text-gray-500 mt-1">Gunakan hak suara (voting) Anda dalam pengambilan keputusan operasional outlet.</p>
      </div>

      <div className="space-y-6 mt-8">
        {votings.map((vote) => (
          <div key={vote.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                  vote.status === "Aktif" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {vote.status}
                </span>
              </div>
              {vote.status === "Aktif" && (
                <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                  <Clock className="w-3.5 h-3.5" /> Deadline: {vote.deadline}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">{vote.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{vote.desc}</p>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Partisipasi Voting</span>
                <span className="text-sm font-bold text-gray-900">{vote.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${vote.progress}%` }} />
              </div>
            </div>

            {vote.status === "Aktif" ? (
              vote.voted ? (
                <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                  <span className="text-sm text-gray-600">Suara Anda telah direkam.</span>
                  <div className="flex items-center gap-2">
                    {vote.voted === "setuju" ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-green-600"><CheckCircle2 className="w-4 h-4" /> Setuju</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-red-600"><XCircle className="w-4 h-4" /> Tidak Setuju</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleVote(vote.id, "tidak")}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12"
                  >
                    Tidak Setuju
                  </Button>
                  <Button 
                    onClick={() => handleVote(vote.id, "setuju")}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20 h-12"
                  >
                    Setuju
                  </Button>
                </div>
              )
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100 opacity-75">
                <span className="text-sm text-gray-600">Voting Selesai</span>
                <span className="font-bold text-green-600">Keputusan: Disetujui</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
