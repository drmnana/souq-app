import { useApp } from '../AppContext';
import ListingCard from '../components/ListingCard';

export default function MyListingsPage({ setPage, setSelectedListing }) {
  const { user, listings } = useApp();

  if (!user) return null;

  const myListings = listings.filter(l => l.seller_name === user.name || l.id);

  return (
    <div className="page-enter" style={{ padding: '30px 0 60px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26 }}>إعلاناتي</h1>
            <p style={{ color: 'var(--text-muted)' }}>{myListings.length} إعلان منشور</p>
          </div>
          <button className="btn-accent" onClick={() => setPage('new-listing')}>+ إضافة إعلان جديد</button>
        </div>

        {myListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>لا توجد إعلانات بعد</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>أضف أول إعلان لك الآن مجاناً</p>
            <button className="btn-primary" onClick={() => setPage('new-listing')}>+ إضافة إعلان</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {myListings.map(l => (
              <ListingCard key={l.id} listing={l} onClick={() => { setSelectedListing(l); setPage('listing-detail'); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
