import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Calendar,
  Search,
  ShoppingBag,
  Plus,
  Check,
  Clock
} from 'lucide-react';

import { useCart } from '../context/CartContext';


const Menu = () => {

  const navigate = useNavigate();

  const {
    menuItems,
    menuLoading,
    menuError,
    addToCart,
    itemCount,
    totalAmount
  } = useCart();


  const [
    selectedCategory,
    setSelectedCategory
  ] = useState('All');


  const [
    searchQuery,
    setSearchQuery
  ] = useState('');


  const [
    addedAnimationId,
    setAddedAnimationId
  ] = useState(null);


  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    'All',
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
    'Lunch'
  ];


  // =========================
  // FILTER ITEMS
  // =========================

  const filteredItems =
    menuItems.filter((item) => {

      const matchesCategory =
        selectedCategory === 'All' ||
        item.category ===
          selectedCategory;


      const search =
        searchQuery
          .toLowerCase()
          .trim();


      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search) ||

        (Array.isArray(item.ingredients) &&
          item.ingredients.some(
            (ingredient) =>
              ingredient
                .toLowerCase()
                .includes(search)
          ));


      return (
        matchesCategory &&
        matchesSearch
      );

    });


  // =========================
  // ADD TO CART
  // =========================

  const handleAdd = (item) => {

    addToCart(item);

    setAddedAnimationId(
      item.id
    );

    setTimeout(() => {

      setAddedAnimationId(null);

    }, 1000);

  };


  // =========================
  // LOADING
  // =========================

  if (menuLoading) {

    return (

      <div className="flex items-center justify-center min-h-[400px]">

        <div className="text-center">

          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#14805f] rounded-full animate-spin mx-auto mb-3" />

          <p className="text-sm text-gray-500">
            Loading menu...
          </p>

        </div>

      </div>

    );

  }


  // =========================
  // ERROR
  // =========================

  if (menuError) {

    return (

      <div className="bg-white rounded-2xl border border-red-100 p-12 text-center">

        <p className="text-sm font-semibold text-red-600">
          {menuError}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Please make sure the backend server is running.
        </p>

      </div>

    );

  }


  return (

    <div className="space-y-6 pb-20 relative">


      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Canteen Menu
          </h1>

          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Freshly prepared dishes available today
          </p>

        </div>


        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 shadow-xs">

          <Calendar
            size={14}
            className="text-gray-400"
          />

          <span>
            Today's Menu
          </span>

        </div>

      </div>


      {/* =========================
          FILTER + SEARCH
      ========================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">


        {/* Categories */}

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">

          {categories.map(
            (category) => (

              <button
                key={category}

                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }

                type="button"

                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory ===
                  category
                    ? 'bg-[#14805f] text-white font-semibold shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200/90 hover:bg-gray-50'
                }`}
              >

                {category}

              </button>

            )
          )}

        </div>


        {/* Search */}

        <div className="relative min-w-[240px]">

          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          <input
            type="text"

            value={searchQuery}

            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }

            placeholder="Search dishes or ingredients..."

            className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#14805f] focus:ring-2 focus:ring-[#14805f]/15 transition-all shadow-xs"
          />

        </div>

      </div>


      {/* =========================
          MENU GRID
      ========================= */}

      {filteredItems.length === 0 ? (

        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">

          <p className="text-sm font-medium">
            No dishes found matching your criteria.
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredItems.map(
            (dish) => {

              const isJustAdded =
                addedAnimationId ===
                dish.id;
              const isAvailable = dish.isAvailable !== false;


              return (

                <div
                  key={dish.id}

                  className={`bg-white rounded-2xl border border-gray-100/90 p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group ${
                    !isAvailable ? 'opacity-75' : ''
                  }`}
                >

                  {/* =========================
                      IMAGE (only displayed if available)
                  ========================= */}

                  <div>

                    {dish.image_url && (
                      <div className="overflow-hidden rounded-xl h-44 bg-gray-100 relative mb-2">

                        <img
                          src={dish.image_url}
                          alt={dish.name}

                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            !isAvailable ? 'grayscale' : ''
                          }`}

                          loading="lazy"

                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                        {!isAvailable && (
                          <span className="absolute top-2.5 right-2.5 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                            Out of Stock
                          </span>
                        )}

                      </div>
                    )}


                    {/* =========================
                        DETAILS
                    ========================= */}

                    <div className="px-1.5 pt-2 pb-2">


                      {/* Category & Availability Tag */}

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-block text-[10px] font-semibold text-[#14805f] bg-emerald-50 px-2 py-1 rounded-md">
                          {dish.category}
                        </span>

                        {!isAvailable && !dish.image_url && (
                          <span className="inline-block text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            Out of Stock
                          </span>
                        )}
                      </div>


                      {/* Name */}

                      <h3 className="text-sm font-bold text-[#111827]">

                        {dish.name}

                      </h3>


                      {/* Ingredients */}

                      {Array.isArray(dish.ingredients) && dish.ingredients.length > 0 && (
                        <p className="text-xs text-[#64748b] leading-relaxed mt-1 line-clamp-2">

                          {dish.ingredients.join(
                            ', '
                          )}

                        </p>
                      )}


                      {/* Prep Time */}

                      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">

                        <Clock
                          size={13}
                        />

                        <span>
                          {dish.avgPrepTimeMinutes || 10}{' '}
                          min preparation
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* =========================
                      PRICE + CART
                  ========================= */}

                  <div className="px-1.5 pt-3 flex items-center justify-between border-t border-gray-50">


                    {/* Price */}

                    <span className="text-sm font-bold text-[#111827]">

                      ₹{dish.price}

                    </span>


                    {/* Add Button */}

                    <button
                      onClick={() =>
                        isAvailable && handleAdd(dish)
                      }
                      disabled={!isAvailable}

                      type="button"

                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs ${
                        !isAvailable
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-600 text-white scale-95 cursor-pointer'
                          : 'bg-[#14805f] hover:bg-[#106d50] text-white cursor-pointer'
                      }`}
                    >

                      {!isAvailable ? (
                        <span>Unavailable</span>
                      ) : isJustAdded ? (

                        <>
                          <Check
                            size={14}
                          />

                          Added
                        </>

                      ) : (

                        <>
                          <Plus
                            size={14}
                          />

                          Add to Cart
                        </>

                      )}

                    </button>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}


      {/* =========================
          FLOATING CART
      ========================= */}

      {itemCount > 0 && (

        <div

          onClick={() =>
            navigate('/cart')
          }

          className="fixed bottom-7 right-10 bg-[#111827] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs font-semibold cursor-pointer hover:bg-black transition-all hover:scale-105 z-40 border border-white/10"
        >

          <div className="flex items-center gap-2">

            <ShoppingBag
              size={16}
            />

            <span>

              {itemCount}{' '}

              {itemCount === 1
                ? 'item'
                : 'items'}

            </span>

          </div>


          <span className="text-gray-500">
            |
          </span>


          <span className="text-[#34d399] font-bold">

            ₹
            {totalAmount.toFixed(
              2
            )}

          </span>

        </div>

      )}

    </div>

  );

};


export default Menu;
