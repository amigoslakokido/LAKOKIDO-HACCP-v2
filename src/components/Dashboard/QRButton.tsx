import { useState } from 'react';
import { QrCode, X } from 'lucide-react';

interface QRButtonProps {
 language: 'ar' | 'no';
}

export function QRButton({ language }: QRButtonProps) {
 const [showModal, setShowModal] = useState(false);

 return (
 <>
 <button
 onClick={() => setShowModal(true)}
 className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/20"
 title={language === 'ar' ? 'QR code for mobile' : 'QR-kode for mobil'}
 >
 <QrCode className="w-5 h-5" />
 </button>

 {showModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
 <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative animate-zoom" onClick={(e) => e.stopPropagation()}>
 <button
 onClick={() => setShowModal(false)}
 className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
 >
 <X className="w-5 h-5 text-slate-600" />
 </button>

 <div className="text-center space-y-3">
 <div className="flex items-center justify-center gap-2 mb-2">
 <QrCode className="w-6 h-6 text-blue-600" />
 <h2 className="text-xl font-bold text-slate-900">
 {language === 'ar' ? 'QR code' : 'QR-kode'}
 </h2>
 </div>

 <p className="text-slate-600 text-xs px-2">
 {language === 'ar'
 ? 'Scan code to open app on mobile'
 : 'Skann koden for å åpne på mobil'}
 </p>

 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-100">
 <div className="bg-white p-2 rounded-lg shadow-lg mx-auto" style={{width: 'fit-content'}}>
 <img
 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`}
 alt="QR Code"
 className="w-48 h-48 mx-auto"
 />
 </div>
 </div>

 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
 <p className="text-xs font-medium text-amber-800 mb-1">
 {language === 'ar' ? '💡 How to use:' : '💡 Slik gjør du:'}
 </p>
 <ul className="text-xs text-amber-700 space-y-0.5">
 <li>• {language === 'ar' ? 'Open mobile camera' : 'Åpne kameraet'}</li>
 <li>• {language === 'ar' ? 'Scan the code' : 'Skann koden'}</li>
 <li>• {language === 'ar' ? 'Tap the notification' : 'Trykk på varsel'}</li>
 </ul>
 </div>

 <div className="pt-2">
 <p className="text-xs text-slate-500 mb-1">{language === 'ar' ? 'Link:' : 'Link:'}</p>
 <p className="text-xs font-mono text-slate-700 break-all bg-slate-100 rounded-lg p-2">
 {window.location.origin}
 </p>
 </div>
 </div>
 </div>
 </div>
 )}

 <style>{`
 @keyframes zoom {
 0% {
 transform: scale(0.3);
 opacity: 0;
 }
 100% {
 transform: scale(1);
 opacity: 1;
 }
 }
 .animate-zoom {
 animation: zoom 0.3s ease-out;
 }
 `}</style>
 </>
 );
}
