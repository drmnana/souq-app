import { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { CATEGORIES } from '../lib/supabase';

export default function ListingDetailPage({ listing, setPage }) {
  const { incrementViews, listings } = useApp();
  const [activeImage, setActiveImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (listing) incrementViews(listing.id);
    window.scrollTo(0, 0);
  }, [listing?.id]);

  if (!listing) return null;

  const cat = CATEGORIES.find(c => c.id === listing.category);
  const similar = listings.filter(l => l.category === listing.category && l.id !== listing.id).slice(0, 3);

  const formatPrice = (price, currency) => {
    if (!price) return 'السعر عند الاستفسار';
    return `${price.toLocaleString('en-US')} ${currency === 'USD' ? 'دولار أمريكي' : 'ليرة سورية'}`;
  };

  return (
    <><MobileStyles /><div className="page-enter" style={{ padding: '20px 0 60px' }}>
      <div className="container">
        {/* Back */}
        <button onClick={() => setPage('listings')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--brand-primary)', fontFamily: 'var(--font-body)',
          fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6
        }}>
          ← العودة للإعلانات
        </button>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }} className="detail-layout">
          {/* Left: Images + Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Main image */}
            <div style={{
              background: '#f0f0f0', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', height: 380, marginBottom: 10
            }}>
              {listing.images?.[activeImage] ? (
                <img src={listing.images[activeImage]} alt={listing.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
                  {cat?.icon}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {listing.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImage(i)} style={{
                    width: 70, height: 70, borderRadius: 8,
                    overflow: 'hidden', cursor: 'pointer',
                    border: i === activeImage ? '3px solid var(--brand-primary)' : '3px solid transparent'
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Full Description */}
            <div style={{
              background: 'white', borderRadius: 'var(--radius-md)',
              padding: 24, marginTop: 20, boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 14 }}>
                تفاصيل الإعلان
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                {listing.description}
              </p>

              {/* Spec table */}
              {(listing.category === 'real-estate' || listing.category === 'cars') && (
                <div style={{
                  marginTop: 20, borderTop: '1px solid var(--border)',
                  paddingTop: 16, display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12
                }}>
                  {listing.area && <SpecItem label="المساحة" value={`${listing.area} م²`} />}
                  {listing.rooms && <SpecItem label="الغرف" value={`${listing.rooms} غرف`} />}
                  {listing.bathrooms && <SpecItem label="الحمامات" value={listing.bathrooms} />}
                  {listing.year && <SpecItem label="سنة الصنع" value={listing.year} />}
                  {listing.mileage && <SpecItem label="المسافة" value={`${listing.mileage?.toLocaleString('en-US')} كم`} />}
                  {listing.color && <SpecItem label="اللون" value={listing.color} />}
                </div>
              )}
            </div>
          </div>

          {/* Right: Price + Contact */}
          <div style={{ width: 300, flexShrink: 0 }} className="detail-sidebar">
            {/* Price card */}
            <div style={{
              background: 'white', borderRadius: 'var(--radius-md)',
              padding: 24, boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--brand-primary)'
            }}>
              <div style={{ marginBottom: 12 }}>
                <span className="badge badge-green">{cat?.label}</span>
                {listing.featured && <span className="badge badge-orange" style={{ marginRight: 6 }}>⭐ مميز</span>}
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, marginBottom: 10, lineHeight: 1.5
              }}>{listing.title}</h1>

              {/* THE PRICE - the whole point of this platform */}
              <div style={{
                background: 'linear-gradient(135deg, #e8f5ee, #f0faf5)',
                borderRadius: 10, padding: '16px',
                marginBottom: 16, border: '1px solid #c8e6d5'
              }}>
                <div style={{ fontSize: 12, color: 'var(--brand-primary)', fontWeight: 600, marginBottom: 4 }}>
                  السعر المطلوب
                </div>
                <div style={{
                  fontSize: 26, fontWeight: 900, color: 'var(--brand-primary)',
                  fontFamily: 'var(--font-display)'
                }}>
                  {formatPrice(listing.price, listing.currency)}
                  {listing.type === 'إيجار' && <span style={{ fontSize: 14, fontWeight: 500, marginRight: 6 }}>/شهرياً</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                <span>📍</span><span>{listing.location}</span>
              </div>

              {/* Contact */}
              {showPhone ? (
                <div style={{
                  background: '#f0faf5', border: '1px solid var(--brand-secondary)',
                  borderRadius: 10, padding: 14, textAlign: 'center', marginBottom: 12
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>رقم التواصل</div>
                  <a href={`tel:${listing.contact}`} style={{
                    fontSize: 20, fontWeight: 800, color: 'var(--brand-primary)',
                    textDecoration: 'none', fontFamily: 'var(--font-display)',
                    direction: 'ltr', display: 'block'
                  }}>{listing.contact}</a>
                </div>
              ) : (
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                  onClick={() => setShowPhone(true)}>
                  📞 عرض رقم الهاتف
                </button>
              )}

              <a href={`https://wa.me/${listing.contact?.replace(/\+|\s/g, '')}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#25d366', color: 'white', padding: '12px',
                  borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15,
                  fontFamily: 'var(--font-body)'
                }}>
                <span style={{ fontSize: 20 }}>💬</span> واتساب
              </a>

              <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                  <span>👁 {listing.views} مشاهدة</span>
                  <span>البائع: {listing.seller_name}</span>
                </div>
              </div>
            </div>

            {/* Safety tip */}
            <div style={{
              background: '#fff3cd', border: '1px solid #ffc107',
              borderRadius: 10, padding: 14, marginTop: 16
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠️ نصيحة الأمان</div>
              <p style={{ fontSize: 12, color: '#856404', lineHeight: 1.7 }}>
                لا تدفع أي مبلغ قبل رؤية البضاعة شخصياً. تحقق من هوية البائع والتقِ في أماكن آمنة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div></>
  );
}

function MobileStyles() {
  return (
    <style>{`
      @media (max-width: 768px) {
        .detail-layout { flex-direction: column-reverse !important; }
        .detail-sidebar { width: 100% !important; }
      }
    `}</style>
  );
}

function SpecItem({ label, value }) {
  return (
    <div style={{ background: '#f8f8f8', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{value}</div>
    </div>
  );
}
