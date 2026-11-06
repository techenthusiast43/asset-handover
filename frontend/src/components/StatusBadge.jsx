import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban, HelpCircle } from 'lucide-react';

export function StatusBadge({ status }) {
  // HandoverStatus: 0 = None, 1 = Pending, 2 = Accepted, 3 = Rejected, 4 = Cancelled
  switch (status) {
    case 1:
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          Pending Recipient
        </span>
      );
    case 2:
    case 'Accepted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Handover Accepted
        </span>
      );
    case 3:
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Handover Rejected
        </span>
      );
    case 4:
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
          <Ban className="w-3.5 h-3.5" />
          Handover Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <HelpCircle className="w-3.5 h-3.5" />
          In Custody
        </span>
      );
  }
}

