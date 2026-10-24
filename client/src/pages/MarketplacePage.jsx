import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import FarmMap from '../components/FarmMap';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Check,
  Map,
  LayoutGrid
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'grains', label: 'Grains & Flour' },
  { id: 'dairy', label: 'Dairy & Cheese' },
  { id: 'herbs', label: 'Herbs & Botanicals' },
  { id: 'honey', label: 'Honey' },
];

export default function MarketplacePage({ initialCategory, initialSearch, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState(initialSearch || '');
  const [category, setCategory] = useState(initialCategory || '');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [freshness, setFreshness] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Map
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map' | 'split'
  const [farmLocations, setFarmLocations] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        organic: organicOnly ? 'true' : undefined,
        freshness: freshness || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        order,
      };

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, organicOnly, freshness, minPrice, maxPrice, sort, order]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch farm locations for the map
  useEffect(() => {
    async function loadFarmLocations() {
      try {
        const res = await api.getFarmLocations();
        if (res.success && res.data) {
          setFarmLocations(res.data);
        }
      } catch (err) {
        console.error('Failed to load farm locations:', err);
      }
    }
    loadFarmLocations();
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setOrganicOnly(false);
    setFreshness('');
    setMinPrice('');
    setMaxPrice('');
    setSort('createdAt');
    setOrder('desc');
    setPage(1);
    setSelectedFarmId(null);
  };

  const handleFarmSelect = (farmId) => {
    setSelectedFarmId(farmId === selectedFarmId ? null : farmId);
  };

  // Filter products by selected farm
  const displayProducts = selectedFarmId
    ? products.filter(p => p.farmerId === selectedFarmId)
    : products;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2d6a4f', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
          <Store size={15} /> Direct Producer Marketplace
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#081c15' }}>
              Fresh Farm Produce
            </h1>
            <p style={{ color: '#52635a', fontSize: '15px' }}>
              Browse {total} seasonal fruits, vegetables, grains and dairy sourced directly from certified local growers.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            background: '#f5f4ee',
            borderRadius: '12px',
            padding: '3px',
            gap: '2px',
          }}>
            {[
              { id: 'grid', icon: <LayoutGrid size={15} />, label: 'Grid' },
              { id: 'map', icon: <Map size={15} />, label: 'Map' },
              { id: 'split', icon: <><LayoutGrid size={13} /><Map size={13} /></>, label: 'Split' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: viewMode === mode.id ? '#ffffff' : 'transparent',
                  color: viewMode === mode.id ? '#081c15' : '#7e9187',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: viewMode === mode.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Filter & Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #ebe7dc',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fbfbf9',
          border: '1px solid #ebe7dc',
          borderRadius: '12px',
          padding: '8px 14px',
          flex: '1 1 280px',
          maxWidth: '400px'
        }}>
          <Search size={18} style={{ color: '#52b788', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search produce, farm name, or city..."
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', color: '#081c15' }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="input-field"
            style={{ width: 'auto', padding: '8px 14px', fontSize: '13px', borderRadius: '10px' }}
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Organic Toggle */}
          <button
            onClick={() => { setOrganicOnly(!organicOnly); setPage(1); }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: `1.5px solid ${organicOnly ? '#2d6a4f' : '#ebe7dc'}`,
              background: organicOnly ? '#edfbf1' : '#ffffff',
              color: organicOnly ? '#1b4332' : '#52635a',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} style={{ color: organicOnly ? '#40916c' : '#7e9187' }} />
            Organic Only
          </button>

          {/* Sort */}
          <select
            value={`${sort}:${order}`}
            onChange={e => {
              const [s, o] = e.target.value.split(':');
              setSort(s);
              setOrder(o);
              setPage(1);
            }}
            className="input-field"
            style={{ width: 'auto', padding: '8px 14px', fontSize: '13px', borderRadius: '10px' }}
          >
            <option value="createdAt:desc">Newest Harvest</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="soldCount:desc">Best Sellers</option>
            <option value="rating:desc">Highest Rated</option>
          </select>

          {/* Reset button */}
          {(search || category || organicOnly || minPrice || maxPrice || selectedFarmId) && (
            <button
              onClick={handleResetFilters}
              style={{
                padding: '8px 12px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Reset all filters"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Selected Farm Badge */}
      {selectedFarmId && (() => {
        const farm = farmLocations.find(f => f.farmerId === selectedFarmId);
        return farm ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#edfbf1',
            border: '1.5px solid #95d5b2',
            borderRadius: '12px',
            padding: '8px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1b4332',
          }}>
            <MapPin size={14} style={{ color: '#2d6a4f' }} />
            Showing products from <strong>{farm.farmName}</strong> ({farm.city}, {farm.state})
            <button
              onClick={() => setSelectedFarmId(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '15px',
                lineHeight: 1,
                padding: '0 4px',
              }}
            >×</button>
          </div>
        ) : null;
      })()}

      {/* Map View */}
      {(viewMode === 'map' || viewMode === 'split') && farmLocations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <FarmMap
            farms={farmLocations}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleFarmSelect}
            height={viewMode === 'map' ? '520px' : '340px'}
          />
        </div>
      )}

      {/* Produce Grid */}
      {viewMode !== 'map' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#7e9187' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #d8f3dc',
                borderTop: '3px solid #2d6a4f',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite',
              }} />
              Loading certified marketplace produce...
            </div>
          ) : displayProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #ebe7dc'
            }}>
              <Store size={48} style={{ color: '#c2b9a1', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#081c15', marginBottom: '6px' }}>
                No produce matches your filters
              </h3>
              <p style={{ fontSize: '14px', color: '#52635a', marginBottom: '20px' }}>
                Try broadening your search term or clearing active category filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}>
                {displayProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  paddingTop: '20px'
                }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="btn btn-outline btn-sm"
                    style={{ opacity: page <= 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#52635a' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="btn btn-outline btn-sm"
                    style={{ opacity: page >= totalPages ? 0.5 : 1 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Full Map View — Product list sidebar */}
      {viewMode === 'map' && !loading && displayProducts.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#081c15', marginBottom: '12px' }}>
            {selectedFarmId ? `Products from selected farm` : `All ${total} Products`}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {displayProducts.slice(0, 6).map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
