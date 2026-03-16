import { useState } from 'react';
import { useApp } from '../AppContext';

export default function Navbar({ page, setPage }) {
  const { user, profile, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || user?.role === 'admin';

  const closeMenu = () => setMenuOpen(false);

  const navigate = (p) => { setPage(p); closeMenu(); };

  return (
    <>
      <nav style={{
        background: 'var(--bg-dark)',
        borderBottom: '3px solid var(--brand-accent)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px', height: 60
        }}>

          {/* Logo */}
          <button onClick={() => navigate('home')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{ position: 'relative', width: 34, height: 34 }}>
              <svg width="34" height="34" viewBox="0 0 38 38" fill="none">
                <path d="M4 4 Q4 0 8 0 L30 0 Q34 0 34 4 L34 26 Q34 30 30 30 L22 30 L19 38 L16 30 L8 30 Q4 30 4 26 Z" fill="#2a4a8a"/>
                <text x="19" y="21" textAnchor="middle" fontSize="18" fontWeight="900" fill="#f0b429" fontFamily="Arial">+</text>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: 'white' }}>
              إعلانات<span style={{ color: 'var(--brand-accent)' }}>+</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desk-nav">
            <NavBtn active={page === 'home'} onClick={() => navigate('home')}>الرئيسية</NavBtn>
            <NavBtn active={page === 'listings'} onClick={() => navigate('listings')}>الإعلانات</NavBtn>
            {user && <NavBtn active={page === 'my-listings'} onClick={() => navigate('my-listings')}>إعلاناتي</NavBtn>}
            {isAdmin && <NavBtn active={page === 'admin'} onClick={() => navigate('admin')}><span style={{ color: 'var(--brand-accent)' }}>⚡ الإدارة</span></NavBtn>}
          </div>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desk-nav">
            {user ? (
              <>
                <span style={{ color: '#aaa', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                  {profile?.name || user?.email?.split('@')[0]}
                </span>
                <button className="btn-accent" onClick={() => navigate('new-listing')} style={{ padding: '7px 14px', fontSize: 13 }}>
                  + أضف إعلان
                </button>
                <button onClick={() => { logout(); closeMenu(); }} style={{
                  background: 'none', border: '1px solid #444', color: '#aaa',
                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 12
                }}>خروج</button>
              </>
            ) : (
              <>
                <button className="btn-outline" onClick={() => navigate('login')} style={{ padding: '7px 16px', borderColor: '#555', color: '#ddd' }}>دخول</button>
                <button className="btn-accent" onClick={() => navigate('register')} style={{ padding: '7px 16px' }}>إنشاء حساب</button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="mob-menu-btn" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'none', flexDirection: 'column', gap: 5, padding: 8
          }}>
            <span style={{ width: 22, height: 2, background: menuOpen ? 'var(--brand-accent)' : 'white', display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}/>
            <span style={{ width: 22, height: 2, background: 'white', display: 'block', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }}/>
            <span style={{ width: 22, height: 2, background: menuOpen ? 'var(--brand-accent)' : 'white', display: 'block', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}/>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            background: '#0d1b3e', borderTop: '1px solid #1a2e5a',
            padding: '12px 0'
          }}>
            <MobItem onClick={() => navigate('home')}>الرئيسية</MobItem>
            <MobItem onClick={() => navigate('listings')}>الإعلانات</MobItem>
            {user && <MobItem onClick={() => navigate('my-listings')}>إعلاناتي</MobItem>}
            {isAdmin && <MobItem onClick={() => navigate('admin')}>⚡ لوحة الإدارة</MobItem>}
            <div style={{ borderTop: '1px solid #1a2e5a', margin: '8px 0' }} />
            {user ? (
              <>
                <MobItem onClick={() => navigate('new-listing')} accent>+ أضف إعلانك الآن</MobItem>
                <MobItem onClick={() => { logout(); closeMenu(); }}>تسجيل الخروج</MobItem>
              </>
            ) : (
              <>
                <MobItem onClick={() => navigate('login')}>دخول</MobItem>
                <MobItem onClick={() => navigate('register')} accent>إنشاء حساب مجاناً</MobItem>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desk-nav { display: none !important; }
          .mob-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function NavBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(255,255,255,0.1)' : 'none',
      border: 'none', color: active ? 'white' : '#bbb',
      padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all 0.2s'
    }}>{children}</button>
  );
}

function MobItem({ children, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'none', border: 'none', textAlign: 'right',
      padding: '12px 20px', color: accent ? 'var(--brand-accent)' : '#ccc',
      fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: accent ? 700 : 400,
      cursor: 'pointer', display: 'block'
    }}>{children}</button>
  );
}
