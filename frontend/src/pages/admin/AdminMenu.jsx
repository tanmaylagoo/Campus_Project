import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Trash2, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminMenu = () => {
  const categories = ['All Categories', 'Snacks', 'Dosa', 'Uttappam', 'Sandwiches', 'Grilled', 'Rice', 'Noodles', 'Gravy', 'Soup', 'Chaat', 'Lunch'];

  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // tracks which item is being acted on

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Snacks',
    price: '',
    ingredients: '',
    avgPrepTimeMinutes: '10',
    imageUrl: '',
  });

  // Fetch menu items from backend
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/menu`);
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

  // Toggle availability
  const toggleAvailability = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to toggle availability');
      const data = await response.json();
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: data.isAvailable } : item
        )
      );
    } catch (err) {
      console.error('Error toggling availability:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Add item
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price) return;
    setActionLoading('add');
    try {
      const response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: Number(newItem.price),
          ingredients: newItem.ingredients
            ? newItem.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          avgPrepTimeMinutes: Number(newItem.avgPrepTimeMinutes) || 10,
          imageUrl: newItem.imageUrl || '',
        }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const data = await response.json();
      setMenuItems((prev) => [...prev, data.item]);
      setNewItem({ name: '', category: 'Snacks', price: '', ingredients: '', avgPrepTimeMinutes: '10', imageUrl: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding item:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting item:', err);
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
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesAvailability && matchesSearch;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7b8494] mt-1">
            Manage items and availability for your canteen.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-[#14805f] hover:bg-[#106d50] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-xs"
        >
          <Plus size={14} />
          Add Item
        </button>
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
            placeholder="Search food..."
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
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#7b8494] border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {['All', 'Available', 'Unavailable'].map((f) => (
            <button
              key={f}
              onClick={() => setAvailabilityFilter(f)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
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
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-bold text-[#111827]">{item.name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-medium text-[#7b8494] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                      {item.category}
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
                      onClick={() => toggleAvailability(item.id)}
                      disabled={actionLoading === item.id}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        item.isAvailable ? 'bg-[#14805f]' : 'bg-gray-300'
                      } ${actionLoading === item.id ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                          item.isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => setShowDeleteConfirm(item)}
                      className="text-[11px] font-semibold text-[#dc2626] hover:text-red-700 bg-[#fef2f2] hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111827] truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#7b8494] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-[#111827]">₹{item.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
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
                    onClick={() => toggleAvailability(item.id)}
                    disabled={actionLoading === item.id}
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
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(item)}
                  className="text-[11px] font-semibold text-[#dc2626] hover:text-red-700 bg-[#fef2f2] hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-xs text-[#7b8494]">No menu items found.</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#111827]">Add Menu Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#7b8494] hover:text-[#111827] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Vada Pav"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] bg-white"
                >
                  {categories.filter((c) => c !== 'All Categories').map((cat) => (
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
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Ingredients
                </label>
                <input
                  type="text"
                  value={newItem.ingredients}
                  onChange={(e) => setNewItem({ ...newItem, ingredients: e.target.value })}
                  placeholder="e.g. pav, batata vada, chutney (comma separated)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={newItem.avgPrepTimeMinutes}
                  onChange={(e) => setNewItem({ ...newItem, avgPrepTimeMinutes: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#7b8494] uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#14805f]/30 focus:border-[#14805f] text-[#172033] placeholder:text-[#7b8494]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-medium text-[#7b8494] hover:text-[#172033] px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={actionLoading === 'add' || !newItem.name.trim() || !newItem.price}
                className="text-xs font-semibold text-white bg-[#14805f] hover:bg-[#106d50] px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {actionLoading === 'add' && <Loader2 size={12} className="animate-spin" />}
                Add Item
              </button>
            </div>
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
                Are you sure you want to remove <span className="font-semibold text-[#111827]">{showDeleteConfirm.name}</span> from the menu? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 text-xs font-medium text-[#7b8494] hover:text-[#172033] px-4 py-2.5 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(showDeleteConfirm.id)}
                disabled={actionLoading === showDeleteConfirm.id}
                className="flex-1 text-xs font-semibold text-white bg-[#dc2626] hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                {actionLoading === showDeleteConfirm.id && <Loader2 size={12} className="animate-spin" />}
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
