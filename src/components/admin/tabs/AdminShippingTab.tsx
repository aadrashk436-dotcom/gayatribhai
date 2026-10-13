import React from "react"

interface PincodeResult {
  city: string
  pincode: string
  delhivery: string
  blueDart: string
  dtdc: string
}

interface AdminShippingTabProps {
  checkPincode: string
  setCheckPincode: (pin: string) => void
  pincodeResult: PincodeResult | null
  handlePincodeCheck: (e: React.FormEvent) => void
}

export const AdminShippingTab: React.FC<AdminShippingTabProps> = ({
  checkPincode,
  setCheckPincode,
  pincodeResult,
  handlePincodeCheck,
}) => {
  return (
    <div className="space-y-6">
      {/* Integration Details Card */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Shiprocket Direct Logistics</h4>
            <p className="text-xs text-zinc-400">Live shipping calculation and automated courier assignment</p>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
            🟢 Connected: gayatripuri634@gmail.com
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Surat Atelier Warehouse</p>
            <p className="font-semibold text-white text-xs mt-1">Ring Road Textile Market, Surat, Gujarat 395002</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Default Package Standard</p>
            <p className="font-semibold text-white text-xs mt-1">0.35 kg • 30cm × 25cm × 4cm</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Partner Carriers</p>
            <p className="font-semibold text-white text-xs mt-1">Delhivery Surface, BlueDart Air, DTDC</p>
          </div>
        </div>
      </div>

      {/* Live Pincode Serviceability Tester */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
        <h4 className="font-serif text-base font-bold text-white">Live PIN Code Serviceability Checker</h4>
        <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit PIN code (e.g. 110001)"
            value={checkPincode}
            onChange={(e) => setCheckPincode(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
          >
            Check PIN
          </button>
        </form>

        {pincodeResult && (
          <div className="mt-4 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-4 text-xs space-y-2">
            <p className="font-bold text-white">
              Destination: {pincodeResult.city} (PIN: {pincodeResult.pincode}) - Serviceable ✅
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-zinc-300">
              <p>
                <strong>Delhivery:</strong> {pincodeResult.delhivery}
              </p>
              <p>
                <strong>BlueDart:</strong> {pincodeResult.blueDart}
              </p>
              <p>
                <strong>DTDC:</strong> {pincodeResult.dtdc}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
