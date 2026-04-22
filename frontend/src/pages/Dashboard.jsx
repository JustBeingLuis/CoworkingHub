import { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button, Input, Label } from '../components/ui/Forms';
import { Modal } from '../components/ui/Modal';
import { format } from '../utils/dateUtils';
import { cn } from '../utils/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const SPACES_PAGE_SIZE = 6;

const Dashboard = () => {
  const { t } = useTranslation();
  const [spacesData, setSpacesData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0, summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Availability logic
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: ''
  });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Modal inline feedback (replaces browser alerts)
  const [modalMessage, setModalMessage] = useState({ type: '', text: '' });

  const loadSpaces = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), size: String(SPACES_PAGE_SIZE) });
      const data = await fetchApi(`/api/espacios/disponibles?${params.toString()}`);
      setSpacesData({
        content: data.pagina?.content || [],
        pageNumber: data.pagina?.pageNumber || 0,
        totalPages: data.pagina?.totalPages || 0,
        totalElements: data.pagina?.totalElements || 0,
        summary: data.resumen || {}
      });
      setError('');
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces(0);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const getStartHourOptions = () => {
    const currentHour = new Date().getHours();
    const isToday = availabilityForm.fecha === todayStr;
    return [...Array(14)].map((_, i) => i + 7)
      .filter(h => !isToday || h > currentHour)
      .map(h => String(h).padStart(2, '0') + ':00');
  };

  const getEndHourOptions = () => {
    const startHour = availabilityForm.horaInicio
      ? parseInt(availabilityForm.horaInicio.split(':')[0], 10)
      : null;
    return [...Array(14)].map((_, i) => i + 8)
      .filter(h => startHour === null || h > startHour)
      .map(h => String(h).padStart(2, '0') + ':00');
  };

  const handleDateChange = (newDate) => {
    // Clamp: if user typed a past date, force it to today
    const validDate = (!newDate || newDate < todayStr) ? todayStr : newDate;

    const currentHour = new Date().getHours();
    const isToday = validDate === todayStr;
    const currentStart = availabilityForm.horaInicio
      ? parseInt(availabilityForm.horaInicio.split(':')[0], 10)
      : null;
    const currentEnd = availabilityForm.horaFin
      ? parseInt(availabilityForm.horaFin.split(':')[0], 10)
      : null;

    const newStart = isToday && currentStart !== null && currentStart <= currentHour ? '' : availabilityForm.horaInicio;
    const newEnd = newStart === '' ? '' : (currentEnd !== null && currentStart !== null && currentEnd <= parseInt((newStart || '0').split(':')[0], 10)) ? '' : availabilityForm.horaFin;

    setAvailabilityForm({ fecha: validDate, horaInicio: newStart, horaFin: newEnd });
    setAvailabilityResult(null);
  };

  const handleStartChange = (newStart) => {
    const startHour = newStart ? parseInt(newStart.split(':')[0], 10) : null;
    const endHour = availabilityForm.horaFin ? parseInt(availabilityForm.horaFin.split(':')[0], 10) : null;
    const newEnd = endHour !== null && startHour !== null && endHour <= startHour ? '' : availabilityForm.horaFin;
    setAvailabilityForm({ ...availabilityForm, horaInicio: newStart, horaFin: newEnd });
  };

  const openModal = (space) => {
    setSelectedSpace(space);
    setAvailabilityResult(null);
    setModalMessage({ type: '', text: '' });
    setAvailabilityForm({
      fecha: todayStr,
      horaInicio: '',
      horaFin: ''
    });
  };

  const closeModal = () => {
    setSelectedSpace(null);
    setModalMessage({ type: '', text: '' });
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityForm.fecha) return;
    setModalMessage({ type: '', text: '' });

    try {
      setCheckingAvailability(true);
      const params = new URLSearchParams({ fecha: availabilityForm.fecha });
      if (availabilityForm.horaInicio && availabilityForm.horaFin) {
        params.set('horaInicio', availabilityForm.horaInicio);
        params.set('horaFin', availabilityForm.horaFin);
      }
      
      const data = await fetchApi(`/api/espacios/${selectedSpace.id}/disponibilidad?${params.toString()}`);
      setAvailabilityResult(data);
    } catch (err) {
      setModalMessage({ type: 'error', text: err.message || 'Error consultando disponibilidad' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleReserve = async () => {
    setModalMessage({ type: '', text: '' });
    try {
      setBookingLoading(true);
      await fetchApi('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({
          espacioId: selectedSpace.id,
          fecha: availabilityForm.fecha,
          horaInicio: availabilityForm.horaInicio,
          horaFin: availabilityForm.horaFin
        })
      });
      
      setModalMessage({ type: 'success', text: t('dashboard.bookingSuccess') });
      // Reload spaces in background
      loadSpaces(spacesData.pageNumber);
      // Auto-close modal after 2.5 seconds on success
      setTimeout(() => {
        closeModal();
      }, 2500);
    } catch (err) {
      setModalMessage({ type: 'error', text: err.message || err.data?.message || 'Error al crear la reserva' });
    } finally {
      setBookingLoading(false);
    }
  };

  const hasItems = spacesData.content.length > 0;
  const { summary } = spacesData;

  const canReserve = Boolean(
    availabilityForm.fecha &&
    availabilityForm.horaInicio &&
    availabilityForm.horaFin
  );

  const selectClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-primary/30 shadow-sm transition-colors";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h2>
        <p className="text-slate-500 dark:text-zinc-400">{t('dashboard.desc')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-100/50 dark:bg-zinc-900/50">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription>{t('dashboard.totalSpaces')}</CardDescription>
            <CardTitle className="text-3xl">{summary.totalEspacios || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-100/50 dark:bg-zinc-900/50">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription>{t('dashboard.totalCapacity')}</CardDescription>
            <CardTitle className="text-3xl">{summary.capacidadAcumulada || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-100/50 dark:bg-zinc-900/50">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardDescription>{t('dashboard.spaceTypes')}</CardDescription>
            <CardTitle className="text-3xl">{summary.tiposDisponibles || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-medium">
          {error}
        </div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-slate-500">{t('common.loading')}</div>
      ) : !hasItems ? (
        <Card className="py-12 text-center border-dashed">
          <CardHeader>
            <CardTitle>{t('dashboard.noSpaces')}</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {spacesData.content.map(space => (
            <Card key={space.id} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl leading-tight line-clamp-1">{space.nombre}</CardTitle>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {t(`admin.spaceTypes.${space.tipo}`, space.tipo)}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                  {space.descripcionTipo || "Espacio habilitado para reserva dentro del coworking."}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-end justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium uppercase tracking-wider">{t('admin.spaces.tableCap')}</span>
                    <span className="font-semibold">{space.capacidad} {t('dashboard.capacityDesc')}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium uppercase tracking-wider">{t('dashboard.hour')}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${space.precioPorHora?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full" onClick={() => openModal(space)}>
                  {t('dashboard.checkAvailability')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Container */}
      {!loading && hasItems && spacesData.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-zinc-800">
          <p className="text-sm text-slate-500">
            {t('common.page')} {spacesData.pageNumber + 1} {t('common.of')} {spacesData.totalPages}
          </p>
          <div className="space-x-2 flex">
            <Button 
              variant="outline" 
              disabled={spacesData.pageNumber === 0} 
              onClick={() => loadSpaces(spacesData.pageNumber - 1)}
            >
              {t('common.previous')}
            </Button>
            <Button 
              variant="outline" 
              disabled={spacesData.pageNumber >= spacesData.totalPages - 1} 
              onClick={() => loadSpaces(spacesData.pageNumber + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}

      {/* ====== Booking Modal (Premium) ====== */}
      <Modal 
        isOpen={!!selectedSpace} 
        onClose={closeModal} 
        title={t('dashboard.modalTitle')}
      >
        <div className="space-y-5">
          
          {/* Success State */}
          {modalMessage.type === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{modalMessage.text}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{t('dashboard.bookingSuccessDesc')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Space Info Header */}
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-zinc-900/60 dark:border-zinc-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                  {selectedSpace?.nombre?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{selectedSpace?.nombre}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    <span>{t(`admin.spaceTypes.${selectedSpace?.tipo}`, selectedSpace?.tipo)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <span>{selectedSpace?.capacidad} {t('dashboard.capacityDesc')}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">${selectedSpace?.precioPorHora}/{t('dashboard.hour')}</span>
                  </div>
                </div>
              </div>

              {/* Date & Time Form */}
              <form onSubmit={handleCheckAvailability} className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">{t('dashboard.selectDate')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fecha" className="text-xs">{t('myReservations.date')}</Label>
                      <Input 
                        id="fecha" 
                        type="date" 
                        min={todayStr}
                        value={availabilityForm.fecha}
                        onChange={e => handleDateChange(e.target.value)}
                        onKeyDown={e => e.preventDefault()}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="horaIni" className="text-xs">{t('dashboard.startTime')}</Label>
                      <select 
                        id="horaIni" 
                        className={selectClasses}
                        value={availabilityForm.horaInicio}
                        onChange={e => handleStartChange(e.target.value)}
                        required
                      >
                        <option value="">--:--</option>
                        {getStartHourOptions().map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="horaFin" className="text-xs">{t('dashboard.endTime')}</Label>
                      <select 
                        id="horaFin" 
                        className={selectClasses}
                        value={availabilityForm.horaFin}
                        onChange={e => setAvailabilityForm({...availabilityForm, horaFin: e.target.value})}
                        required
                      >
                        <option value="">--:--</option>
                        {getEndHourOptions().map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Availability Result */}
                {availabilityResult && (
                  <div className={cn(
                    "rounded-lg border p-3.5 flex items-start gap-3",
                    availabilityResult.rangoConsultadoDisponible || availabilityResult.totalHorariosOcupados === 0
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                      : "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20"
                  )}>
                    <span className={cn(
                      "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                      availabilityResult.rangoConsultadoDisponible ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    <div>
                      <span className={cn(
                        "text-sm font-semibold",
                        availabilityResult.rangoConsultadoDisponible 
                          ? "text-emerald-700 dark:text-emerald-400" 
                          : "text-red-700 dark:text-red-400"
                      )}>
                        {availabilityResult.rangoConsultadoDisponible ? t('dashboard.available') : t('dashboard.occupied')}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        {availabilityResult.mensajeDisponibilidad}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {modalMessage.type === 'error' && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3.5 border border-red-200/50 dark:bg-red-950/20 dark:border-red-900/30">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{modalMessage.text}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <Button type="submit" variant="outline" disabled={checkingAvailability} className="flex-1 h-11">
                    {checkingAvailability ? t('common.loading') : t('dashboard.checkAvailability')}
                  </Button>
                  <Button 
                    type="button"
                    className="flex-1 h-11" 
                    disabled={!canReserve || bookingLoading} 
                    onClick={handleReserve}
                  >
                    {bookingLoading ? t('common.saving') : t('dashboard.confirmText')}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;
