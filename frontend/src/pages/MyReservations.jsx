import { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Forms';
import { format } from '../utils/dateUtils';
import { AlertCircle, CalendarX2, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/utils';

const RESERVATIONS_PAGE_SIZE = 10;

const MyReservations = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const loadMyReservations = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), size: String(RESERVATIONS_PAGE_SIZE) });
      const res = await fetchApi(`/api/reservas/mias?${params.toString()}`);
      setData(res.pagina || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
      setError('');
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyReservations(0);
  }, []);

  const handleCancel = async (reservaId) => {
    if (!window.confirm(t('myReservations.cancelConfirm'))) return;
    try {
      await fetchApi(`/api/reservas/${reservaId}/cancelar`, { method: 'PATCH' });
      setFeedback({ type: 'success', text: t('myReservations.cancelSuccess') });
      loadMyReservations(data.pageNumber);
      setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || err.data?.message || 'Error cancelando reserva' });
      setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('myReservations.title')}</h2>
        <p className="text-slate-500 dark:text-zinc-400">{t('myReservations.desc')}</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{t('myReservations.cancelPolicyNote')}</p>
      </div>

      {/* Inline Feedback */}
      {feedback.text && (
        <div className={cn(
          "flex items-center gap-3 rounded-lg p-4 border animate-in fade-in slide-in-from-top-2 duration-300",
          feedback.type === 'success'
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
        )}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{feedback.text}</p>
        </div>
      )}

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-medium">
          {error}
        </div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-slate-500">{t('common.loading')}</div>
      ) : data.content.length === 0 ? (
        <Card className="py-16 text-center border-dashed">
          <div className="flex flex-col items-center justify-center space-y-3">
            <h3 className="text-lg font-medium">{t('myReservations.noReservations')}</h3>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-zinc-900 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">{t('myReservations.space')}</th>
                  <th scope="col" className="px-6 py-4">{t('myReservations.date')}</th>
                  <th scope="col" className="px-6 py-4">{t('myReservations.time')}</th>
                  <th scope="col" className="px-6 py-4">{t('myReservations.status')}</th>
                  <th scope="col" className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {data.content.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{res.nombreEspacio}</td>
                    <td className="px-6 py-4">{format(res.fecha)}</td>
                    <td className="px-6 py-4">{res.horaInicio?.slice(0,5)} - {res.horaFin?.slice(0,5)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                        res.estado === 'CONFIRMADA' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : res.estado === 'CANCELADA' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : res.estado === 'FINALIZADA' ? "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {res.estado === 'CONFIRMADA' ? t('myReservations.statusConfirmed')
                          : res.estado === 'CANCELADA' ? t('myReservations.statusCancelled')
                          : res.estado === 'FINALIZADA' ? t('myReservations.statusFinalized')
                          : res.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.estado === 'CONFIRMADA' && (
                        <Button 
                          variant="ghost" 
                          className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 gap-1.5"
                          onClick={() => handleCancel(res.id)}
                        >
                          <CalendarX2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t('myReservations.cancelBtn')}</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-zinc-800">
              <p className="text-sm text-slate-500">
                {t('common.page')} {data.pageNumber + 1} {t('common.of')} {data.totalPages}
              </p>
              <div className="space-x-2">
                <Button variant="outline" disabled={data.pageNumber === 0} onClick={() => loadMyReservations(data.pageNumber - 1)}>{t('common.previous')}</Button>
                <Button variant="outline" disabled={data.pageNumber >= data.totalPages - 1} onClick={() => loadMyReservations(data.pageNumber + 1)}>{t('common.next')}</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default MyReservations;
