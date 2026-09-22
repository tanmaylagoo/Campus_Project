import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, ShoppingBag, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const navigate = useNavigate();
  const { menuItems, addToCart, itemCount, totalAmount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  const categories = ['All', 'Main Course', 'Sides', 'Drinks', 'Desserts'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (item) => {
    addToCart(item);
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1000);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Canteen Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Freshly prepared daily dishes tailored for you
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">
          <Calendar size={14} className="text-gray-400" />
          <span>Today, Oct 24, 2024</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#14805f] text-white font-semibold shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200/90 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes..."
            className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#14805f] focus:ring-2 focus:ring-[#14805f]/15 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Dish Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <p className="text-sm font-medium">No dishes found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((dish) => {
            const isJustAdded = addedAnimationId === dish.id;
            return (
              <div
                key={dish.id}
                className="bg-white rounded-2xl border border-gray-100/90 p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  <div className="overflow-hidden rounded-xl h-44 bg-gray-100 relative">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="px-1.5 pt-3.5 pb-2">
                    <h3 className="text-sm font-bold text-[#111827]">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-[#64748b] leading-relaxed mt-1 line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="px-1.5 pt-3 flex items-center justify-between border-t border-gray-50">
                  <span className="text-sm font-bold text-[#111827]">
                    ${dish.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAdd(dish)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white scale-95'
                        : 'bg-[#14805f] hover:bg-[#106d50] text-white'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Pill */}
      {itemCount > 0 && (
        <div
          onClick={() => navigate('/cart')}
          className="fixed bottom-7 right-10 bg-[#111827] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs font-semibold cursor-pointer hover:bg-black transition-all hover:scale-105 z-40 border border-white/10"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-white" />
            <span>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <span className="text-gray-500">|</span>
          <span className="text-[#34d399] font-bold">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default Menu;
