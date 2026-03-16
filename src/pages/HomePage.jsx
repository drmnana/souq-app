import { useState } from 'react';
import { useApp } from '../AppContext';
import { CATEGORIES, SYRIAN_CITIES } from '../AppContext';
import ListingCard from '../components/ListingCard';

export default function HomePage({ setPage, setSelectedListing }) {
  const { listings, setSearchQuery, setSelectedCategory, setSelectedCity, filteredListings } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [localCity, setLocalCity] = useState('all');

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setSelectedCity(localCity);
    setPage('listings');
  };

  const featuredListings = listings.filter(l => l.featured).slice(0, 4);
  const latestListings = [...listings].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-dark) 0%, #1a3a2a 60%, #0f2419 100%)',
        padding: '70px 0 60px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(245,166,35,0.08)'
        }}/>
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(45,138,94,0.12)'
        }}/>

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(245,166,35,0.15)',
            color: 'var(--brand-accent)',
            padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            marginBottom: 20, border: '1px solid rgba(245,166,35,0.3)'
          }}>
            🇸🇾 الموقع الأول للإعلانات المبوبة في سوريا
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(28px, 5vw, 52px)',
            color: 'white', lineHeight: 1.3, marginBottom: 16
          }}>
            اشترِ وبِع بثقة
            <br/>
            <span style={{ color: 'var(--brand-accent)' }}>بأفضل الأسعار</span>
          </h1>

          <p style={{
            color: '#aaa', fontSize: 18, maxWidth: 500,
            margin: '0 auto 36px', fontFamily: 'var(--font-body)'
          }}>
            آلاف الإعلانات من جميع محافظات سوريا — عقارات، سيارات، إلكترونيات والمزيد
          </p>

          {/* Search Bar */}
          <div style={{
            background: 'white', borderRadius: 14, padding: 8,
            display: 'flex', gap: 8, maxWidth: 700, margin: '0 auto',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
          }}>
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ابحث: شقة في دمشق، سيارة كامري، آيفون..."
              style={{ flex: 1, border: 'none', fontSize: 15, padding: '10px 14px', borderRadius: 8 }}
            />
            <select value={localCity} onChange={e => setLocalCity(e.target.value)}
              style={{ width: 130, border: 'none', borderRight: '1px solid #eee', borderRadius: 0, padding: '10px 8px', fontSize: 14 }}>
              <option value="all">كل المحافظات</option>
              {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={handleSearch} className="btn-accent" style={{ padding: '10px 24px', borderRadius: 8 }}>
              🔍 بحث
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            {[
              { n: `${listings.length}+`, l: 'إعلان نشط' },
              { n: '13', l: 'محافظة' },
              { n: '8', l: 'تصنيف' },
              { n: '100%', l: 'مجاناً' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-accent)', fontFamily: 'var(--font-display)' }}>{s.n}</div>
                <div style={{ fontSize: 13, color: '#999' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: '50px 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <SectionHeader title="تصفح حسب الفئة" subtitle="اختر الفئة التي تبحث عنها" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12, marginTop: 24
          }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => {
                setSelectedCategory(cat.id);
                setPage('listings');
              }} style={{
                background: 'white',
                border: '2px solid transparent',
                borderRadius: 'var(--radius-md)',
                padding: '20px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = cat.color;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontWeight: 700,
                  fontSize: 14, color: 'var(--text-primary)'
                }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {listings.filter(l => l.category === cat.id).length} إعلان
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <div style={{ padding: '40px 0', background: '#fff8f0' }}>
          <div className="container">
            <SectionHeader title="⭐ الإعلانات المميزة" subtitle="" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20, marginTop: 24
            }}>
              {featuredListings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={() => {
                  setSelectedListing(l);
                  setPage('listing-detail');
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Latest listings */}
      <div style={{ padding: '40px 0 60px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <SectionHeader title="أحدث الإعلانات" subtitle="" inline />
            <button className="btn-outline" onClick={() => setPage('listings')} style={{ flexShrink: 0 }}>
              عرض الكل
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20
          }}>
            {latestListings.map(l => (
              <ListingCard key={l.id} listing={l} onClick={() => {
                setSelectedListing(l);
                setPage('listing-detail');
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        padding: '50px 20px', textAlign: 'center'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'white', marginBottom: 12 }}>
          هل لديك شيء لبيعه؟
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24, fontSize: 16 }}>
          أضف إعلانك مجاناً وابدأ البيع اليوم — الخدمة مجانية لمدة سنة كاملة
        </p>
        <button className="btn-accent" onClick={() => setPage('new-listing')}
          style={{ padding: '14px 36px', fontSize: 16 }}>
          + أضف إعلانك الآن
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, inline }) {
  if (inline) return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{subtitle}</p>}
    </div>
  );
  return (
    <div style={{ textAlign: 'center', marginBottom: 8 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</p>}
    </div>
  );
}
