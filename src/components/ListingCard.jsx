import { useApp } from '../AppContext';
import { CATEGORIES } from '../lib/supabase';

export default function ListingCard({ listing, onClick }) {
  const cat = CATEGORIES.find(c => c.id === listing.category);

  const formatPrice = (price, currency) => {
    if (!price) return 'السعر عند الاستفسار';
    return `${price.toLocaleString('en-US')} ${currency === 'USD' ? 'دولار' : 'ل.س'}`;
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    return `منذ ${days} أيام`;
  };

  return (
    <div onClick={onClick} style={{
      background: 'white',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.25s',
      boxShadow: 'var(--shadow-sm)',
      border: listing.featured ? '2px solid var(--brand-accent)' : '2px solid transparent',
      position: 'relative'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}>

      {listing.featured && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          background: 'var(--brand-accent)', color: 'white',
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
        }}>⭐ مميز</div>
      )}

      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f0f0f0' }}>
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display='none'; }}
          />
        ) : (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 48
          }}>{cat?.icon || '📦'}</div>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: cat?.color || '#555', color: 'white',
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600
        }}>{cat?.label}</div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
          color: 'var(--text-primary)', marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.5
        }}>{listing.title}</h3>

        {/* Price - THE KEY DIFFERENTIATOR */}
        <div style={{
          fontSize: 18, fontWeight: 800, color: 'var(--brand-primary)',
          fontFamily: 'var(--font-display)', marginBottom: 8
        }}>
          {formatPrice(listing.price, listing.currency)}
          {listing.category === 'real-estate' && listing.type === 'إيجار' && (
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginRight: 4 }}>/شهر</span>
          )}
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
            <span>📍</span>
            <span>{listing.location}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 12 }}>
            <span>👁 {listing.views}</span>
            <span>🕐 {timeAgo(listing.created_at)}</span>
          </div>
        </div>

        {/* Extra details for specific categories */}
        {listing.category === 'real-estate' && listing.area && (
          <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
            {listing.area && <span>📐 {listing.area} م²</span>}
            {listing.rooms && <span>🛏 {listing.rooms} غرف</span>}
            {listing.bathrooms && <span>🚿 {listing.bathrooms} حمام</span>}
          </div>
        )}
        {listing.category === 'cars' && (
          <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
            {listing.year && <span>📅 {listing.year}</span>}
            {listing.mileage && <span>🛣 {listing.mileage?.toLocaleString('en-US')} كم</span>}
            {listing.color && <span>🎨 {listing.color}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
