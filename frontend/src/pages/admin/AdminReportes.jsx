import { useState } from 'react';
import { fetchApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button, Input, Label } from '../../components/ui/Forms';
import { PieChart, Activity, Clock, DollarSign, ListChecks } from 'lucide-react';
import { cn } from '../../utils/utils';

const REPORT_MAX_SIZE = 2000;

const AdminReportes = () => {
  const { t } = useTranslation();
  const [params, setParams] = useState({
    fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    estado: 'CONFIRMADA'
  });
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!params.fechaInicio || !params.fechaFin) return;

    try {
      setLoading(true);
      setError('');
      const query = new URLSearchParams({
        ...params,
        page: '0',
        size: String(REPORT_MAX_SIZE)
      }).toString();
      const res = await fetchApi(`/api/admin/reportes/ocupacion?${query}`);
      
      // Backend returns { pagina: { content: [...items] }, resumen: { totalReservas, ... } }
      const items = res.pagina?.content || [];
      const resumen = res.resumen || {};

      // Aggregate stats from items
      const totalMinutos = items.reduce((sum, item) => {
        const minutos = Math.max(0, item.duracionMinutos || 0);
        return sum + minutos;
      }, 0);
      const horasTotales = totalMinutos / 60;

      // Group by space for breakdown
      const espacioMap = new Map();
      items.forEach(item => {
        const key = item.espacioId;
        if (!espacioMap.has(key)) {
          espacioMap.set(key, {
            nombreEspacio: item.nombreEspacio,
            tipoEspacio: item.tipoEspacio,
            totalReservas: 0,
            minutosReservados: 0,
          });
        }
        const entry = espacioMap.get(key);
        const minutos = Math.max(0, item.duracionMinutos || 0);
        entry.totalReservas++;
        entry.minutosReservados += minutos;
      });

      const desgloseEspacios = [...espacioMap.values()].map(es => ({
        ...es,
        horasReservadas: es.minutosReservados / 60,
        porcentajeOcupacionRelativa: horasTotales > 0 ? (es.minutosReservados / totalMinutos) * 100 : 0
      }));

      setReportData({
        totalReservas: resumen.totalReservas || items.length,
        horasTotalesReservadas: horasTotales,
        espaciosIncluidos: resumen.espaciosIncluidos || espacioMap.size,
        desgloseEspacios
      });
    } catch (err) {
       setError(err.message || t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const selectClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-primary/30 shadow-sm transition-colors";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('admin.reports.title')}</h2>
        <p className="text-slate-500 dark:text-zinc-400">{t('admin.reports.desc')}</p>
      </div>

      <Card className="p-4 sm:p-6 bg-white dark:bg-zinc-950">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-2 w-full sm:w-auto flex-1">
            <Label htmlFor="inicio">{t('admin.reports.startDate')}</Label>
            <Input 
              id="inicio"
              type="date"
              value={params.fechaInicio}
              onChange={e => setParams({...params, fechaInicio: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2 w-full sm:w-auto flex-1">
             <Label htmlFor="fin">{t('admin.reports.endDate')}</Label>
            <Input 
              id="fin"
              type="date"
              value={params.fechaFin}
              onChange={e => setParams({...params, fechaFin: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2 w-full sm:w-auto">
            <Label htmlFor="estado">{t('myReservations.status')}</Label>
            <select
              id="estado"
              className={selectClasses}
              value={params.estado}
              onChange={e => setParams({...params, estado: e.target.value})}
            >
              <option value="CONFIRMADA">{t('myReservations.statusConfirmed')}</option>
              <option value="FINALIZADA">{t('myReservations.statusFinalized')}</option>
              <option value="CANCELADA">{t('myReservations.statusCancelled')}</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2">
            <PieChart className="h-4 w-4" />
            {loading ? t('admin.reports.generating') : t('admin.reports.generate')}
          </Button>
        </form>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {reportData && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
           {/* Top Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-slate-50 dark:bg-zinc-900 border-none shadow-sm ring-1 ring-slate-100 dark:ring-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 truncate">{t('admin.reports.totalRes')}</p>
                  <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                    <ListChecks className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {reportData.totalReservas}
                  </span>
                </div>
              </CardContent>
            </Card>

             <Card className="bg-slate-50 dark:bg-zinc-900 border-none shadow-sm ring-1 ring-slate-100 dark:ring-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 truncate">{t('admin.reports.totalHours')}</p>
                  <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {reportData.horasTotalesReservadas?.toFixed(1) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-zinc-900 border-none shadow-sm ring-1 ring-slate-100 dark:ring-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 truncate">{t('admin.reports.avgOcc')}</p>
                  <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {reportData.espaciosIncluidos}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-zinc-400 ml-1">espacios</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.reports.breakdownTitle')}</CardTitle>
              <CardDescription>{t('admin.reports.breakdownDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.desgloseEspacios?.length > 0 ? (
                <div className="relative overflow-x-auto rounded-md border border-slate-200 dark:border-zinc-800">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 font-medium text-slate-700 dark:bg-zinc-900 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th scope="col" className="px-4 py-3">Espacio</th>
                        <th scope="col" className="px-4 py-3">Tipo</th>
                        <th scope="col" className="px-4 py-3">Reservas</th>
                        <th scope="col" className="px-4 py-3">Horas</th>
                        <th scope="col" className="px-4 py-3 text-right">Ocupación Relativa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {reportData.desgloseEspacios.map((es, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{es.nombreEspacio}</td>
                          <td className="px-4 py-3">{es.tipoEspacio}</td>
                          <td className="px-4 py-3">{es.totalReservas}</td>
                          <td className="px-4 py-3">{es.horasReservadas.toFixed(1)}</td>
                          <td className="px-4 py-3 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold">{(es.porcentajeOcupacionRelativa || 0).toFixed(1)}%</span>
                                <div className="h-1.5 w-16 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${Math.min(100, es.porcentajeOcupacionRelativa || 0)}%` }}
                                  />
                                </div>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed rounded-md text-slate-500">
                  {t('admin.reports.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminReportes;
