import { useState } from 'react';
import { useApp, CATEGORIES, SYRIAN_CITIES } from '../AppContext';
import ListingCard from '../components/ListingCard';

export default function ListingsPage({ setPage, setSelectedListing }) {
  const {
    listings, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedCity, setSelectedCity,
    sortBy, setSortBy, totalCount
  } = useApp();
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setSearchQuery(''); setSelectedCategory('all');
    setSelectedCity('all'); setSortBy('newest');
  };

  const activeFilters = (selectedCategory !== 'all' ? 1 : 0) + (selectedCity !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="page-enter" style={{ padding: '20px 0 60px' }}>
      <div className="container">

        {/* Mobile filter bar */}
        <div className="mob-filters" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث..." style={{ flex: 1 }} />
            <button onClick={() => setShowFilters(o => !o)} style={{
              background: showFilters ? 'var(--brand-primary)' : 'white',
              color: showFilters ? 'white' : 'var(--brand-primary)',
              border: '1.5px solid var(--brand-primary)',
              padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6
            }}>
              فلترة {activeFilters > 0 && <span style={{ background: 'var(--brand-accent)', color: 'var(--brand-primary)', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{activeFilters}</span>}
            </button>
          </div>

          {showFilters && (
            <div style={{ background: 'white', borderRadius: 10, padding: 16, boxShadow: 'var(--shadow-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>الفئة</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                  <option value="all">الكل</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>المدينة</label>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                  <option value="all">الكل</option>
                  {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ترتيب</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">الأحدث</option>
                  <option value="price-asc">السعر ↑</option>
                  <option value="price-desc">السعر ↓</option>
                  <option value="views">الأكثر مشاهدة</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={clearFilters} style={{
                  width: '100%', background: '#f5f5f5', border: 'none',
                  padding: '10px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', color: '#666', fontSize: 13
                }}>مسح الكل</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 24 }}>

          {/* Desktop Sidebar */}
          <aside className="desk-sidebar" style={{
            width: 230, flexShrink: 0,
            background: 'white', borderRadius: 'var(--radius-md)',
            padding: 20, height: 'fit-content',
            boxShadow: 'var(--shadow-sm)', alignSelf: 'flex-start',
            position: 'sticky', top: 80
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, marginBottom: 18 }}>
              تصفية النتائج
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>بحث</label>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ماذا تبحث عن؟" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>الفئة</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="all">جميع الفئات</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>المحافظة</label>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                <option value="all">كل المحافظات</option>
                {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>ترتيب حسب</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="views">الأكثر مشاهدة</option>
              </select>
            </div>
            <button onClick={clearFilters} style={{
              width: '100%', background: '#f5f5f5', border: 'none',
              padding: '10px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-body)', color: '#666', fontSize: 13
            }}>✖ مسح الفلاتر</button>
          </aside>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16, background: 'white', padding: '10px 14px',
              borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: 18 }}>{listings.length}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13, marginRight: 5 }}>إعلان</span>
              </span>
              {selectedCategory !== 'all' && (
                <span className="badge badge-green">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
              )}
            </div>

            {listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>لا توجد نتائج</h3>
                <p style={{ color: 'var(--text-muted)' }}>جرب تغيير كلمات البحث أو الفلاتر</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16
              }}>
                {listings.map(l => (
                  <ListingCard key={l.id} listing={l} onClick={() => {
                    setSelectedListing(l); setPage('listing-detail');
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desk-sidebar { display: none !important; }
          .mob-filters { display: block !important; }
        }
        @media (min-width: 769px) {
          .mob-filters { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: 5, fontFamily: 'var(--font-body)'
};
