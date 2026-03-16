import { useState } from 'react';
import { useApp } from '../AppContext';

export default function Navbar({ page, setPage }) {
  const { user, profile, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      background: 'var(--bg-dark)',
      borderBottom: '3px solid var(--brand-accent)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px', height: 64
      }}>
        {/* Logo */}
        <button onClick={() => setPage('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <div style={{
            background: 'var(--brand-accent)',
            color: 'white', width: 38, height: 38,
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20, fontWeight: 900,
            fontFamily: 'var(--font-display)'
          }}>س</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 22, color: 'white', letterSpacing: '-0.5px'
          }}>سوق سوريا</span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}
             className="desktop-nav">
          <NavBtn active={page === 'home'} onClick={() => setPage('home')}>الرئيسية</NavBtn>
          <NavBtn active={page === 'listings'} onClick={() => setPage('listings')}>الإعلانات</NavBtn>
          {user && <NavBtn active={page === 'my-listings'} onClick={() => setPage('my-listings')}>إعلاناتي</NavBtn>}
          {(profile?.role === 'admin' || user?.role === 'admin') && (
            <NavBtn active={page === 'admin'} onClick={() => setPage('admin')}>
              <span style={{ color: 'var(--brand-accent)' }}>⚡ لوحة الإدارة</span>
            </NavBtn>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <span style={{ color: '#aaa', fontSize: 14, fontFamily: 'var(--font-body)' }}>
                أهلاً، {profile?.name || user?.email?.split('@')[0]}
              </span>
              <button className="btn-accent" onClick={() => setPage('new-listing')}
                style={{ padding: '8px 16px', fontSize: 14 }}>
                + أضف إعلان
              </button>
              <button onClick={logout} style={{
                background: 'none', border: '1px solid #444', color: '#aaa',
                padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13
              }}>خروج</button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => setPage('login')}
                style={{ padding: '8px 18px', borderColor: '#555', color: '#ddd' }}>
                دخول
              </button>
              <button className="btn-accent" onClick={() => setPage('register')}
                style={{ padding: '8px 18px' }}>
                إنشاء حساب
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function NavBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(255,255,255,0.1)' : 'none',
      border: 'none', color: active ? 'white' : '#bbb',
      padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 600 : 400,
      transition: 'all 0.2s'
    }}
    onMouseEnter={e => { if(!active) e.target.style.color = 'white'; }}
    onMouseLeave={e => { if(!active) e.target.style.color = '#bbb'; }}
    >{children}</button>
  );
}
