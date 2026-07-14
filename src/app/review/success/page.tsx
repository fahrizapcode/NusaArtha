"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          🎉 Selamat! Brand Anda Telah Disetujui
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Brand Anda telah lolos proses verifikasi platform dan kini dapat menggunakan seluruh fitur untuk mengembangkan bisnis melalui ekosistem franchise, investasi, dan pengelolaan outlet.
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-8 text-left max-w-sm mx-auto">
          <div className="space-y-6">
            <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-green-500" />
              <CheckCircle2 className="w-6 h-6 text-green-500 bg-gray-50 relative z-10" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Brand Terdaftar</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-green-500" />
              <CheckCircle2 className="w-6 h-6 text-green-500 bg-gray-50 relative z-10" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Profil Lengkap</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-green-500" />
              <CheckCircle2 className="w-6 h-6 text-green-500 bg-gray-50 relative z-10" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Review Platform</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 bg-gray-50 relative z-10" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Brand Disetujui</p>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => router.push("/dashboard?status=approved")}
          className="bg-green-600 hover:bg-green-700 text-white font-medium gap-2 px-8"
        >
          Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
