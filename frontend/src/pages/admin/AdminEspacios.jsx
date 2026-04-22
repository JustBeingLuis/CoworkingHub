import { useState, useEffect } from 'react';
import { fetchApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Button, Input, Label } from '../../components/ui/Forms';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit } from 'lucide-react';
import { cn } from '../../utils/utils';

const SPACES_PAGE_SIZE = 10;

const AdminEspacios = () => {
  const { t } = useTranslation();
  const [spacesData, setSpacesData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [spaceTypes, setSpaceTypes] = useState([]); // Array of { id, nombre, descripcion }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form & Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', tipoId: '', capacidad: 1, precioPorHora: 0, activo: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSpaces = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), size: String(SPACES_PAGE_SIZE) });
      const data = await fetchApi(`/api/admin/espacios?${params.toString()}`);
      // Backend returns PageResponse directly (content, pageNumber, etc. at root)
      setSpacesData(data || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      // Backend returns List<TipoEspacioResponse> = [{ id: 1, nombre: "Escritorio", descripcion: "..." }, ...]
      const types = await fetchApi('/api/admin/espacios/tipos-espacio');
      setSpaceTypes(types || []);
    } catch (err) {
      console.error("Error loading types", err);
    }
  };

  useEffect(() => {
    loadTypes();
    loadSpaces(0);
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setFormData({ nombre: '', tipoId: spaceTypes[0]?.id || '', capacidad: 1, precioPorHora: 0, activo: true });
    setIsFormOpen(true);
  };

  const openEditForm = (space) => {
    setEditingId(space.id);
    // Backend response has: id, nombre, capacidad, precioPorHora, activo, tipoId, tipoNombre
    setFormData({ 
      nombre: space.nombre, 
      tipoId: space.tipoId, 
      capacidad: space.capacidad, 
      precioPorHora: space.precioPorHora,
      activo: space.activo
    });
    setIsFormOpen(true);
  };

  const saveSpace = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = editingId ? `/api/admin/espacios/${editingId}` : '/api/admin/espacios';
      const method = editingId ? 'PUT' : 'POST';
      
      // Backend expects EspacioAdminRequest: { nombre, capacidad, precioPorHora, activo, tipoId }
      await fetchApi(url, {
        method,
        body: JSON.stringify({
          nombre: formData.nombre,
          capacidad: formData.capacidad,
          precioPorHora: formData.precioPorHora,
          activo: formData.activo,
          tipoId: Number(formData.tipoId)
        })
      });
      
      setIsFormOpen(false);
      loadSpaces(spacesData.pageNumber);
    } catch (err) {
      alert(err.message || 'Error al guardar el espacio');
    } finally {
      setSaving(false);
    }
  };

  const selectClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-slate-500";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('admin.spaces.title')}</h2>
          <p className="text-slate-500 dark:text-zinc-400">{t('admin.spaces.desc')}</p>
        </div>
        <Button onClick={openNewForm} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t('admin.spaces.new')}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-medium">{error}</div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-slate-500">{t('common.loading')}</div>
      ) : (
        <Card className="overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-zinc-900 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">{t('admin.spaces.tableSpace')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.spaces.tableType')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.spaces.tableCap')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.spaces.tablePrice')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.spaces.tableStatus')}</th>
                  <th scope="col" className="px-6 py-4 text-right">{t('admin.spaces.tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {spacesData.content.map(space => (
                  <tr key={space.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{space.nombre}</td>
                    <td className="px-6 py-4">{t(`admin.spaceTypes.${space.tipoNombre}`, space.tipoNombre)}</td>
                    <td className="px-6 py-4">{space.capacidad}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">${space.precioPorHora?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 flex w-fit items-center gap-1.5 rounded-full text-xs font-semibold",
                        space.activo 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {space.activo ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" className="h-8 w-8 p-0" title={t('common.edit')} onClick={() => openEditForm(space)}>
                        <Edit className="h-4 w-4" />
                       </Button>
                    </td>
                  </tr>
                ))}
                {spacesData.content.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      {t('admin.spaces.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-zinc-800">
            <p className="text-sm text-slate-500">
              {t('common.page')} {spacesData.pageNumber + 1} {t('common.of')} {spacesData.totalPages || 1}
            </p>
            <div className="space-x-2">
              <Button variant="outline" disabled={spacesData.pageNumber === 0} onClick={() => loadSpaces(spacesData.pageNumber - 1)}>{t('common.previous')}</Button>
              <Button variant="outline" disabled={spacesData.pageNumber >= spacesData.totalPages - 1} onClick={() => loadSpaces(spacesData.pageNumber + 1)}>{t('common.next')}</Button>
            </div>
          </div>
        </Card>
      )}

      <Modal isOpen={isFormOpen} onClose={() => !saving && setIsFormOpen(false)} title={editingId ? t('admin.spaces.edit') : t('admin.spaces.new')}>
        <form onSubmit={saveSpace} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">{t('admin.spaces.nameLabel')}</Label>
            <Input 
              id="nombre" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">{t('admin.spaces.typeLabel')}</Label>
            <select 
              id="tipo" 
              className={selectClasses}
              value={formData.tipoId}
              onChange={e => setFormData({...formData, tipoId: e.target.value})}
              required
            >
              <option value="" disabled className="dark:bg-zinc-900">Seleccionar...</option>
              {spaceTypes.map(tipo => <option key={tipo.id} value={tipo.id} className="dark:bg-zinc-900">{tipo.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="capacidad">{t('admin.spaces.capLabel')}</Label>
              <Input id="capacidad" type="number" min="1" value={formData.capacidad} onChange={e => setFormData({...formData, capacidad: Number(e.target.value)})} required />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="precio">{t('admin.spaces.priceLabel')}</Label>
              <Input id="precio" type="number" min="0" step="0.01" value={formData.precioPorHora} onChange={e => setFormData({...formData, precioPorHora: Number(e.target.value)})} required />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-200 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminEspacios;
