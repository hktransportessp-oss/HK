import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/CommonComponents';
import { Search, FileText, Building2, MapPin, DollarSign, ScanLine } from 'lucide-react';

export const LinkedInvoicesScreen: React.FC = () => {
  const { invoices, selectedTripId, navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const tripInvoices = selectedTripId
    ? invoices.filter(inv => inv.tripId === selectedTripId)
    : invoices;

  const filteredInvoices = tripInvoices.filter(inv =>
    inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.accessKey.includes(searchQuery)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2042]">
            {tripInvoices.length} NF-es Vinculadas
          </h1>
          <p className="text-xs text-slate-500">
            Documentos fiscais e manifestos eletrônicos da viagem.
          </p>
        </div>
        <button
          onClick={() => navigateTo('SCAN_INVOICE')}
          className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <ScanLine className="w-4 h-4" />
          <span>Vincular NF-e</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por número da NF-e, destinatário ou cidade..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2042] shadow-2xs"
        />
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Nenhuma nota fiscal encontrada.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verifique o filtro ou vincule uma nova NF-e.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#0F2042]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F2042]">{inv.number}</h3>
                    <p className="text-[10px] font-mono text-slate-400 truncate max-w-[220px] sm:max-w-md">
                      Chave: {inv.accessKey}
                    </p>
                  </div>
                </div>
                <StatusBadge status={inv.status} />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">{inv.recipient}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Destino: {inv.city}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Valor da Nota</p>
                  <p className="text-sm font-extrabold text-[#0F2042]">
                    R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
