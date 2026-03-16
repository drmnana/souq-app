import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp, CATEGORIES } from '../AppContext';

const COLORS = ['#1a5f3f','#2d8a5e','#f5a623','#1565c0','#6a1b9a','#e65100','#ad1457','#546e7a'];

export default function AdminDashboard({ setPage, setSelectedListing }) {
  const { user, profile, listings, stats, pendingListings, loadAdminData, approveListing, rejectListing, isDemo } = useApp();
  const [tab, setTab] = useState('overview');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator' || user?.role === 'admin';

  useEffect(() => { if (isAdmin) loadAdminData(); }, [isAdmin]);

  if (!isAdmin) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 60 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 16 }}>غير مصرح</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>هذه الصفحة للمشرفين فقط</p>
      {isDemo && <p style={{ fontSize: 13, color: 'var(--brand-secondary)', marginTop: 8 }}>للتجربة: سجّل دخول بإيميل يحتوي على "admin"</p>}
    </div>
  );

  const catStats = CATEGORIES.map(cat => ({
    name: cat.label, value: listings.filter(l => l.category === cat.id).length
  })).filter(c => c.value > 0);

  const kpis = [
    { icon: '📋', label: 'إعلانات نشطة', value: listings.length, color: 'var(--brand-primary)' },
    { icon: '⏳', label: 'قيد المراجعة', value: pendingListings.length, color: '#e65100' },
    { icon: '👥', label: 'المستخدمون', value: stats?.totalUsers || 0, color: '#1565c0' },
    { icon: '👁', label: 'إجمالي المشاهدات', value: (stats?.totalViews || 0).toLocaleString(), color: '#6a1b9a' },
  ];

  return (
    <div className="page-enter" style={{ padding: '24px 0 60px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26 }}>⚡ لوحة الإدارة</h1>
            {isDemo && <span style={{ fontSize: 12, background: '#fff3cd', color: '#856404', padding: '3px 10px', borderRadius: 20 }}>وضع تجريبي</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: '📊 نظرة عامة' },
              { id: 'moderation', label: `⏳ مراجعة ${pendingListings.length > 0 ? `(${pendingListings.length})` : ''}` },
              { id: 'performance', label: '📈 الأداء' },
              { id: 'profit', label: '💰 الأرباح' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? 'var(--brand-primary)' : 'white',
                color: tab === t.id ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${tab === t.id ? 'var(--brand-primary)' : 'var(--border)'}`,
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', borderTop: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 26 }}>{k.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: k.color, marginTop: 8 }}>{k.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* MODERATION TAB */}
        {tab === 'moderation' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>إعلانات قيد المراجعة</h3>
            {pendingListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p>لا توجد إعلانات تنتظر المراجعة</p>
              </div>
            ) : pendingListings.map(l => (
              <div key={l.id} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {l.images?.[0] && (
                  <img src={l.images[0]} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{l.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    📍 {l.location} | 💰 {l.price?.toLocaleString()} {l.currency === 'USD' ? '$' : 'ل.س'} | 👤 {l.profiles?.name || l.seller_name}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.description}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => approveListing(l.id)} style={{
                    background: 'var(--brand-primary)', color: 'white', border: 'none',
                    padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700
                  }}>✅ موافقة</button>
                  {rejectId === l.id ? (
                    <div>
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        placeholder="سبب الرفض..." style={{ marginBottom: 6, fontSize: 13 }} />
                      <button onClick={() => { rejectListing(l.id, rejectReason); setRejectId(null); setRejectReason(''); }} style={{
                        background: '#c62828', color: 'white', border: 'none',
                        padding: '8px 16px', borderRadius: 8, cursor: 'pointer', width: '100%', fontFamily: 'var(--font-body)'
                      }}>تأكيد الرفض</button>
                    </div>
                  ) : (
                    <button onClick={() => setRejectId(l.id)} style={{
                      background: 'white', color: '#c62828', border: '1px solid #c62828',
                      padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)'
                    }}>❌ رفض</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ChartCard title="📈 نمو الإعلانات">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats?.quarterlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="quarter" style={{ fontFamily: 'var(--font-body)', fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={v => [v, 'إعلان']} />
                  <Area type="monotone" dataKey="listings" stroke="var(--brand-primary)" fill="#e8f5ee" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🗂 توزيع الفئات">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                    {catStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <div style={{ gridColumn: '1/-1' }}>
              <ChartCard title="📋 آخر الإعلانات">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8' }}>
                      {['العنوان','الفئة','السعر','الموقع','المشاهدات','الحالة'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.slice(0, 10).map((l, i) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', background: i%2 ? '#fafafa' : 'white', cursor: 'pointer' }}
                        onClick={() => { setSelectedListing(l); setPage('listing-detail'); }}>
                        <td style={{ padding: '10px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</td>
                        <td style={{ padding: '10px 12px' }}><span className="badge badge-green">{CATEGORIES.find(c=>c.id===l.category)?.label}</span></td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--brand-primary)' }}>{l.price?.toLocaleString()} {l.currency==='USD'?'$':'ل.س'}</td>
                        <td style={{ padding: '10px 12px' }}>{l.location}</td>
                        <td style={{ padding: '10px 12px' }}>👁 {l.views}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                            {l.status === 'active' ? 'نشط' : l.status === 'pending' ? 'مراجعة' : l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ChartCard>
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {tab === 'performance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ChartCard title="👥 نمو المستخدمين">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats?.quarterlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="quarter" style={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={v => [v, 'مستخدم']} />
                  <Bar dataKey="users" fill="#1565c0" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🔥 أكثر إعلانات مشاهدة">
              {[...listings].sort((a,b) => b.views - a.views).slice(0, 6).map((l, i) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: i < 3 ? 'var(--brand-accent)' : 'var(--text-muted)', fontSize: 16 }}>#{i+1}</span>
                    <span style={{ fontSize: 13 }}>{l.title.substring(0, 32)}...</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: 14, flexShrink: 0 }}>👁 {l.views}</span>
                </div>
              ))}
            </ChartCard>
          </div>
        )}

        {/* PROFIT TAB */}
        {tab === 'profit' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, var(--bg-dark), #1a3a2a)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24, color: 'white' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>💰 خطة التحقيق والأرباح</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
                {[
                  { label: 'مرحلة مجانية', value: 'سنة كاملة', sub: 'لبناء الجمهور' },
                  { label: 'عدد الإعلانات الحالي', value: listings.length, sub: 'إعلان نشط' },
                  { label: 'إيراد متوقع (سنة 2)', value: `$${(listings.length * 15 * 0.3 * 12).toLocaleString()}`, sub: 'بنسبة تحويل 30%' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--brand-accent)' }}>{s.value}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <ChartCard title="📊 توقع نمو الإيرادات">
              <div style={{ background: '#fff3e0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                <strong>السنة الأولى:</strong> مجاناً للجميع — هدفك التأسيس. السنة الثانية: تبدأ التحصيل.
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={[
                  { q: 'Q1 25', إعلانات: 12, إيراد: 0 },
                  { q: 'Q2 25', إعلانات: 28, إيراد: 0 },
                  { q: 'Q3 25', إعلانات: 45, إيراد: 0 },
                  { q: 'Q4 25', إعلانات: 89, إيراد: 0 },
                  { q: 'Q1 26', إعلانات: 143, إيراد: 644 },
                  { q: 'Q2 26', إعلانات: 220, إيراد: 990 },
                  { q: 'Q3 26', إعلانات: 350, إيراد: 1575 },
                  { q: 'Q4 26', إعلانات: 500, إيراد: 2250 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="q" style={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" /><YAxis yAxisId="r" orientation="right" />
                  <Tooltip formatter={(v, n) => [n === 'إيراد' ? `$${v}` : v, n]} />
                  <Area yAxisId="l" type="monotone" dataKey="إعلانات" stroke="var(--brand-primary)" fill="#e8f5ee" strokeWidth={2} />
                  <Area yAxisId="r" type="monotone" dataKey="إيراد" stroke="var(--brand-accent)" fill="#fff3e0" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginTop: 20 }}>
              {[
                { icon: '📌', title: 'إعلان مميز', price: '$25/أسبوع', desc: 'للوكلاء والتجار' },
                { icon: '📋', title: 'اشتراك شهري', price: '$50/شهر', desc: 'إعلانات غير محدودة' },
                { icon: '🏷', title: 'رسوم نشر', price: '$5/إعلان', desc: 'للأفراد' },
                { icon: '📱', title: 'إعلانات بانر', price: '$100/شهر', desc: 'للشركات الكبرى' },
              ].map(m => (
                <div key={m.title} style={{ background: 'white', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{m.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{m.desc}</div>
                  <div style={{ color: 'var(--brand-accent)', fontWeight: 800, fontSize: 16 }}>{m.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{title}</h3>
      {children}
    </div>
  );
}
