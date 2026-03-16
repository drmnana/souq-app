import { useApp } from '../AppContext';
import { CATEGORIES, SYRIAN_CITIES } from '../AppContext';
import ListingCard from '../components/ListingCard';

export default function ListingsPage({ setPage, setSelectedListing }) {
  const {
    filteredListings, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    selectedCity, setSelectedCity,
    sortBy, setSortBy
  } = useApp();

  return (
    <div className="page-enter" style={{ padding: '30px 0 60px' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

          {/* Sidebar Filters */}
          <aside style={{
            width: 240, flexShrink: 0,
            background: 'white', borderRadius: 'var(--radius-md)',
            padding: 20, height: 'fit-content',
            boxShadow: 'var(--shadow-sm)', alignSelf: 'flex-start',
            position: 'sticky', top: 84
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, marginBottom: 20 }}>
              🔍 تصفية النتائج
            </h3>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>بحث</label>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="ماذا تبحث عن؟" />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>الفئة</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="all">جميع الفئات</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>

            {/* City */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>المدينة / المحافظة</label>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                <option value="all">كل المحافظات</option>
                {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>ترتيب حسب</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="views">الأكثر مشاهدة</option>
              </select>
            </div>

            <button onClick={() => {
              setSearchQuery(''); setSelectedCategory('all');
              setSelectedCity('all'); setSortBy('newest');
            }} style={{
              width: '100%', background: '#f5f5f5', border: 'none',
              padding: '10px', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-body)', color: '#666', fontSize: 14
            }}>
              ✖ مسح الفلاتر
            </button>
          </aside>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Results header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 20, background: 'white', padding: '12px 16px',
              borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--brand-primary)', fontSize: 18 }}>{filteredListings.length}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, marginRight: 6 }}>إعلان</span>
              </span>
              {selectedCategory !== 'all' && (
                <span className="badge badge-green">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </span>
              )}
            </div>

            {filteredListings.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 20px',
                background: 'white', borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
                  لا توجد نتائج
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>جرب تغيير كلمات البحث أو الفلاتر</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 20
              }}>
                {filteredListings.map(l => (
                  <ListingCard key={l.id} listing={l} onClick={() => {
                    setSelectedListing(l);
                    setPage('listing-detail');
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-body)'
};
