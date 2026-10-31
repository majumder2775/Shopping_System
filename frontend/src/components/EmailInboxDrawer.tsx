import React from 'react';
import { useShop } from '../context/ShopContext';
import { db } from '../services/api';
import { Mail, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const EmailInboxDrawer: React.FC = () => {
  const { isEmailInboxOpen, setIsEmailInboxOpen, dbVersion } = useShop();

  if (!isEmailInboxOpen) return null;

  void dbVersion;
  const emails = db.getEmails();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-[#0f1012] border-l border-neutral-800 flex flex-col h-full shadow-2xl text-neutral-100">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Customer Email Dispatch Inbox (FR13 / IT-06)
            </h2>
          </div>
          <button
            onClick={() => setIsEmailInboxOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400 leading-relaxed">
          Transactional email log. Delivery status reflects whether Gmail accepted the message.
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {emails.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-500 font-mono">
              No confirmation emails sent yet. Place an order to trigger an email notification.
            </div>
          ) : (
            emails.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{e.subject}</span>
                  <span className={`text-[10px] font-mono flex items-center gap-1 ${e.deliveryStatus === 'sent' ? 'text-emerald-400' : e.deliveryStatus === 'failed' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {e.deliveryStatus === 'sent' ? <><CheckCircle2 className="w-3 h-3" /> Sent</> : e.deliveryStatus === 'failed' ? <><AlertCircle className="w-3 h-3" /> Failed</> : <><Clock className="w-3 h-3" /> Not verified</>}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-neutral-400">
                  <span>To: </span>
                  <span className="text-amber-300">{e.to}</span>
                </div>

                <div className="p-3 bg-neutral-900/60 rounded-lg text-neutral-300 whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
                  {e.body}
                </div>

                <div className="text-[10px] text-neutral-500 font-mono pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(e.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
