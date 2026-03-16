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
              fontSize: 22, color: 'white', marginBottom: 10
            }}>🟡 سوق سوريا</div>
            <p style={{ fontSize: 13, lineHeight: 1.8 }}>
              المنصة الأولى للإعلانات المبوبة في سوريا. نربط البائعين بالمشترين بكل شفافية.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 12 }}>الفئات</h4>
            {['عقارات', 'سيارات', 'إلكترونيات', 'أثاث', 'وظائف'].map(c => (
              <div key={c} style={{ marginBottom: 6 }}>
                <button onClick={() => setPage('listings')} style={{
                  background: 'none', border: 'none', color: '#999',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13,
                  padding: 0, transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = '#999'}>{c}</button>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 12 }}>روابط</h4>
            {[
              { label: 'الرئيسية', page: 'home' },
              { label: 'الإعلانات', page: 'listings' },
              { label: 'أضف إعلان', page: 'new-listing' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 6 }}>
                <button onClick={() => setPage(l.page)} style={{
                  background: 'none', border: 'none', color: '#999',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, padding: 0
                }}>{l.label}</button>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: 12 }}>تواصل معنا</h4>
            <p style={{ fontSize: 13, lineHeight: 1.8 }}>
              📧 info@souq-syria.com<br/>
              💬 واتساب: +963 XXX XXX XXX<br/>
              🌐 جميع المحافظات السورية
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13 }}>© 2025 سوق سوريا — جميع الحقوق محفوظة</span>
          <span style={{ fontSize: 13 }}>🇸🇾 صُنع من أجل سوريا الجديدة</span>
        </div>
      </div>
    </footer>
  );
}
