import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  Trash2,
  Loader2,
  Pencil,
  Clock,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_CATEGORIES = [
  'Snacks',
  'Dosa',
  'Uttappam',
  'Sandwiches',
  'Grilled',
  'Rice',
  'Noodles',
  'Gravy',
  'Soup',
  'Chaat',
  'Lunch',
  'Beverages',
];

const EMPTY_FORM = {
  name: '',
  category: 'Snacks',
  price: '',
  ingredients: '',
  avgPrepTimeMinutes: '10',
  isAvailable: true,
};

const getAuthHeaders = () => {
  const token =
    sessionStorage.getItem('token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const AdminMenu = () => {
  const { refreshMenu } = useCart();

  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Add mode, object = Edit mode
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Data states
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  };

  // Fetch menu items from backend
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/menu`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Unable to load menu. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Derive categories dynamically so custom categories are also shown
  const categories = [
    'All Categories',
    ...Array.from(
      new Set([
        ...DEFAULT_CATEGORIES,
        ...menuItems.map((i) => i.category).filter(Boolean),
      ])
    ),
  ];

  // Open modal for creating a new item
  const openAddModal = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowFormModal(true);
  };

  // Open modal for editing an existing item
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Snacks',
      price: item.price != null ? String(item.price) : '',
      ingredients: Array.isArray(item.ingredients)
        ? item.ingredients.join(', ')
        : item.ingredients || '',
      avgPrepTimeMinutes:
        item.avgPrepTimeMinutes != null ? String(item.avgPrepTimeMinutes) : '10',
      isAvailable: item.isAvailable !== false,
    });
    setFormError('');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingItem(null);
    setFormError('');
  };

  // Create or Update item (C & U in CRUD)
  const handleSaveItem = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Item name is required.');
      return;
    }
    if (!formData.category.trim()) {
      setFormError('Category is required.');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0 || Number.isNaN(Number(formData.price))) {
      setFormError('Please enter a valid non-negative price.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      ingredients: formData.ingredients
        ? formData.ingredients
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      avgPrepTimeMinutes: Number(formData.avgPrepTimeMinutes) || 10,
      isAvailable: formData.isAvailable,
    };

    const isEdit = Boolean(editingItem);
    const targetId = editingItem ? editingItem.id ?? editingItem._id : null;
    setActionLoading(isEdit ? 'edit' : 'add');

    try {
      const url = isEdit ? `${API_URL}/menu/${targetId}` : `${API_URL}/menu`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'add'} item`);
      }

      if (isEdit) {
        setMenuItems((prev) =>
          prev.map((item) =>
            (item.id ?? item._id) === targetId ? data.item : item
          )
        );
        showToast(`"${data.item.name}" updated successfully`);
      } else {
        setMenuItems((prev) => [...prev, data.item]);
        showToast(`"${data.item.name}" added to menu`);
      }

      if (refreshMenu) refreshMenu();
      closeFormModal();
    } catch (err) {
      console.error(`Error ${isEdit ? 'updating' : 'adding'} item:`, err);
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle availability (PATCH)
  const toggleAvailability = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/menu/${id}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to toggle availability');

      setMenuItems((prev) =>
        prev.map((item) =>
          (item.id ?? item._id) === id
            ? { ...item, isAvailable: data.isAvailable }
            : item
        )
      );
      if (refreshMenu) refreshMenu();
      showToast(data.message || 'Availability updated');
    } catch (err) {
      console.error('Error toggling availability:', err);
      showToast(err.message || 'Failed to update availability', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete item (D in CRUD)
  const handleDeleteItem = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete item');

      const removedName = showDeleteConfirm?.name || 'Item';
      setMenuItems((prev) => prev.filter((item) => (item.id ?? item._id) !== id));
      setShowDeleteConfirm(null);
      if (refreshMenu) refreshMenu();
      showToast(`"${removedName}" removed from menu`);
    } catch (err) {
      console.error('Error deleting item:', err);
      showToast(err.message || 'Failed to delete item', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'All Categories' || item.category === activeCategory;
    const matchesAvailability =
      availabilityFilter === 'All' ||
      (availabilityFilter === 'Available' && item.isAvailable) ||
      (availabilityFilter === 'Unavailable' && !item.isAvailable);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      (Array.isArray(item.ingredients) &&
        item.ingredients.some((ing) => ing.toLowerCase().includes(q)));
    return matchesCategory && matchesAvailability && matchesSearch;
  });

  const totalCount = menuItems.length;
  const availableCount = menuItems.filter((i) => i.isAvailable).length;
  const unavailableCount = totalCount - availableCount;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#14805f] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button
          onClick={fetchMenu}
          className="mt-4 text-xs font-semibold text-[#14805f] hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold transition-all ${
            toast.type === 'error'
              ? 'bg-[#fef2f2] border-red-200 text-[#dc2626]'
              : 'bg-[#111827] border-white/10 text-white'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={15} className="text-[#dc2626] shrink-0" />
          ) : (
            <CheckCircle2 size={15} className="text-[#34d399] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
            Create, edit, and manage food items & availability for your canteen.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          Add Menu Item
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#7b8494] uppercase tracking-wide">
              Total Items
            </p>
            <p className="text-xl font-extrabold text-[#111827] mt-0.5">{totalCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#f1f5f9] text-[#172033] flex items-center justify-center">
            <UtensilsCrossed size={17} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#7b8494] uppercase tracking-wide">
              Available Now
            </p>
            <p className="text-xl font-extrabold text-[#059669] mt-0.5">{availableCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
            <CheckCircle2 size={17} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100/90 p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#7b8494] uppercase tracking-wide">
              Out of Stock
            </p>
            <p className="text-xl font-extrabold text-[#dc2626] mt-0.5">{unavailableCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
            <XCircle size={17} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8494]"
          />
          <input
            type="text"
            placeholder="Search by name, ingredient, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#7b8494] border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 sm:ml-auto">
          {['All', 'Available', 'Unavailable'].map((f) => (
            <button
              key={f}
              onClick={() => setAvailabilityFilter(f)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                availabilityFilter === f
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#7b8494] border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                  Item
                </th>
                <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Category
                </th>
                <th className="text-left text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Prep Time
                </th>
                <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Price
                </th>
                <th className="text-center text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-center text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-4 py-3">
                  Availability
                </th>
                <th className="text-right text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => {
                const itemId = item.id ?? item._id;
                const imgSrc = item.image_url || item.imageUrl;
                return (
                  <tr key={itemId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {imgSrc && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center border border-gray-200/60">
                            <img
                              src={imgSrc}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.parentElement.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0 max-w-xs">
                          <p className="text-xs font-bold text-[#111827] truncate">
                            {item.name}
                          </p>
                          {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                            <p className="text-[11px] text-[#7b8494] truncate mt-0.5">
                              {item.ingredients.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-medium text-[#7b8494] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-[#7b8494]">
                        <Clock size={12} />
                        {item.avgPrepTimeMinutes || 10} min
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-bold text-[#111827]">₹{item.price}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                          item.isAvailable
                            ? 'bg-[#ecfdf5] text-[#059669]'
                            : 'bg-[#fef2f2] text-[#dc2626]'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => toggleAvailability(itemId)}
                        disabled={actionLoading === itemId}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          item.isAvailable ? 'bg-[#14805f]' : 'bg-gray-300'
                        } ${actionLoading === itemId ? 'opacity-50' : ''}`}
                        title="Toggle availability"
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                            item.isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-[11px] font-semibold text-[#172033] hover:text-[#14805f] bg-[#f1f5f9] hover:bg-[#ecfdf5] px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(item)}
                          className="text-[11px] font-semibold text-[#dc2626] hover:text-red-700 bg-[#fef2f2] hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredItems.map((item) => {
            const itemId = item.id ?? item._id;
            const imgSrc = item.image_url || item.imageUrl;
            return (
              <div key={itemId} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {imgSrc && (
                      <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center border border-gray-200/60">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#111827] truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-[#7b8494] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-[#111827]">₹{item.price}</span>
                        <span className="text-[11px] text-[#7b8494] inline-flex items-center gap-0.5">
                          <Clock size={11} /> {item.avgPrepTimeMinutes || 10}m
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        item.isAvailable
                          ? 'bg-[#ecfdf5] text-[#059669]'
                          : 'bg-[#fef2f2] text-[#dc2626]'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      onClick={() => toggleAvailability(itemId)}
                      disabled={actionLoading === itemId}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        item.isAvailable ? 'bg-[#14805f]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                          item.isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                  <p className="text-[11px] text-[#7b8494] line-clamp-1">
                    Ingredients: {item.ingredients.join(', ')}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-[11px] font-semibold text-[#172033] hover:text-[#14805f] bg-[#f1f5f9] hover:bg-[#ecfdf5] px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(item)}
                    className="text-[11px] font-semibold text-[#dc2626] hover:text-red-700 bg-[#fef2f2] hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-xs text-[#7b8494]">No menu items found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#111827]">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={closeFormModal}
                className="text-[#7b8494] hover:text-[#111827] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vada Pav"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] bg-white"
                  >
                    {categories
                      .filter((c) => c !== 'All Categories')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Ingredients (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g. pav, batata vada, green chutney"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.avgPrepTimeMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, avgPrepTimeMinutes: e.target.value })
                    }
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                  />
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) =>
                        setFormData({ ...formData, isAvailable: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#14805f] rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#172033]">
                      Available for order
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="text-xs font-medium text-[#7b8494] hover:text-[#172033] px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    actionLoading === 'add' ||
                    actionLoading === 'edit' ||
                    !formData.name.trim() ||
                    formData.price === ''
                  }
                  className="text-xs font-semibold text-white bg-[#14805f] hover:bg-[#106d50] px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {(actionLoading === 'add' || actionLoading === 'edit') && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#fef2f2] text-[#dc2626] flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#111827] mb-1">Remove Item</h3>
              <p className="text-xs text-[#7b8494]">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-[#111827]">{showDeleteConfirm.name}</span>{' '}
                from the menu? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 text-xs font-medium text-[#7b8494] hover:text-[#172033] px-4 py-2.5 rounded-lg transition-colors border border-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDeleteItem(showDeleteConfirm.id ?? showDeleteConfirm._id)
                }
                disabled={
                  actionLoading === (showDeleteConfirm.id ?? showDeleteConfirm._id)
                }
                className="flex-1 text-xs font-semibold text-white bg-[#dc2626] hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading ===
                  (showDeleteConfirm.id ?? showDeleteConfirm._id) && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
