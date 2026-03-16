import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import ListingCard from '../components/ListingCard';
import { supabase } from '../lib/supabase';

export default function MyListingsPage({ setPage, setSelectedListing }) {
  const { user, isDemo, listings } = useApp();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (isDemo) {
      setMyListings(listings.filter(l => l.user_id === user.id));
      setLoading(false);
      return;
    }
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMyListings(data || []);
        setLoading(false);
      });
  }, [user?.id]);

  if (!user) return null;

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>⏳ جاري التحميل...</p>
          </div>
        ) : myListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>لا توجد إعلانات بعد</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>أضف أول إعلان لك الآن مجاناً</p>
            <button className="btn-primary" onClick={() => setPage('new-listing')}>+ إضافة إعلان</button>
          </div>
        ) : (
          <div>
            {myListings.some(l => l.status === 'pending') && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
                ⏳ بعض إعلاناتك قيد المراجعة وستظهر للعموم بعد موافقة المشرف
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {myListings.map(l => (
                <div key={l.id} style={{ position: 'relative' }}>
                  {l.status === 'pending' && (
                    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: '#ff9800', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      قيد المراجعة
                    </div>
                  )}
                  {l.status === 'rejected' && (
                    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: '#c62828', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      مرفوض
                    </div>
                  )}
                  <ListingCard listing={l} onClick={() => { setSelectedListing(l); setPage('listing-detail'); }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
