import { useState } from 'react';
import { fetchApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Button, Input, Label } from '../../components/ui/Forms';
import { PieChart, Download, Activity, Clock, DollarSign, ListChecks } from 'lucide-react';
import { cn } from '../../utils/utils';

const AdminReportes = () => {
  const { t } = useTranslation();
  const [params, setParams] = useState({
    fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // 1 month ago
    fechaFin: new Date().toISOString().split('T')[0] // Today
  });
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!params.fechaInicio || !params.fechaFin) return;

    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const res = await fetchApi(`/api/admin/reportes/ocupacion?${query}`);
      setReportData(res);
      setError('');
    } catch (err) {
       setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 truncate">{t('admin.reports.revenue')}</p>
                  <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    ${reportData.ingresosEstimados?.toLocaleString() || 0}
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
                    {(reportData.ocupacionPromedioGlobal || 0).toFixed(1)}%
                  </span>
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
                        <th scope="col" className="px-4 py-3">Reservas</th>
                        <th scope="col" className="px-4 py-3">Horas</th>
                        <th scope="col" className="px-4 py-3">Ingresos ($)</th>
                        <th scope="col" className="px-4 py-3 text-right">Ocupación Relativa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {reportData.desgloseEspacios.map((es, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{es.nombreEspacio}</td>
                          <td className="px-4 py-3">{es.totalReservas}</td>
                          <td className="px-4 py-3">{es.horasReservadas.toFixed(1)}</td>
                          <td className="px-4 py-3">${es.ingresosGenerados.toLocaleString()}</td>
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
