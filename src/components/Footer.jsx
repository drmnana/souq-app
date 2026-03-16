export default function Footer({ setPage }) {
  return (
    <footer style={{
      background: 'var(--bg-dark)',
      color: '#999', padding: '40px 0 20px',
      borderTop: '3px solid var(--brand-accent)'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 28, marginBottom: 32 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 26, marginBottom: 10
            }}>
              <span style={{ color: 'white' }}>إعلانات</span>
              <span style={{ color: 'var(--brand-accent)' }}>+</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8 }}>
              المنصة الأولى للإعلانات المبوبة في سوريا. نربط البائعين بالمشترين بكل شفافية وأمان.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 12 }}>الفئات</h4>
            {['عقارات', 'سيارات', 'إلكترونيات', 'أثاث', 'وظائف'].map(c => (
              <div key={c} style={{ marginBottom: 6 }}>
                <button onClick={() => setPage('listings')} style={{
                  background: 'none', border: 'none', color: '#999',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, padding: 0
                }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#999'}>{c}</button>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 12 }}>روابط سريعة</h4>
            {[
              { label: 'الرئيسية', page: 'home' },
              { label: 'جميع الإعلانات', page: 'listings' },
              { label: 'أضف إعلانك', page: 'new-listing' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 6 }}>
                <button onClick={() => setPage(l.page)} style={{
                  background: 'none', border: 'none', color: '#999',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, padding: 0
                }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#999'}>{l.label}</button>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 12 }}>تواصل معنا</h4>
            <p style={{ fontSize: 13, lineHeight: 2 }}>
              📧 info@i3lanatplus.com<br/>
              🌐 i3lanatplus.com<br/>
              🇸🇾 جميع المحافظات السورية
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #222', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13 }}>© 2025 إعلانات+ — جميع الحقوق محفوظة</span>
          <span style={{ fontSize: 13 }}>🇸🇾 صُنع من أجل سوريا الجديدة</span>
        </div>
      </div>
    </footer>
  );
}
