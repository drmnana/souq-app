import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp, CATEGORIES } from '../AppContext';
import { supabase } from '../lib/supabase';

const COLORS = ['#1a2e5a','#2a4a8a','#f0b429','#0f6e56','#6a1b9a','#e65100','#ad1457','#546e7a'];

export default function AdminDashboard({ setPage, setSelectedListing }) {
  const { user, profile, listings, stats, pendingListings, loadAdminData, approveListing, rejectListing } = useApp();
  const [tab, setTab] = useState('moderation');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [blockingId, setBlockingId] = useState(null);

  const role = profile?.role || user?.role;
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator' || role === 'admin';

  useEffect(() => { if (isModerator) loadAdminData(); }, [isModerator]);

  useEffect(() => {
    if (isAdmin && tab === 'users') loadUsers();
  }, [tab, isAdmin]);

  const loadUsers = async () => {
    setUsersLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setUsersLoading(false);
  };

  const updateRole = async (userId, newRole) => {
    setRoleUpdating(userId);
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    await loadUsers();
    setRoleUpdating(null);
  };

  const blockUser = async (userId) => {
    setBlockingId(userId);
    // Delete all their listings
    await supabase.from('listings').update({ status: 'rejected' }).eq('user_id', userId);
    // Set role to blocked
    await supabase.from('profiles').update({ role: 'blocked' }).eq('id', userId);
    await loadUsers();
    setBlockingId(null);
  };

  const deleteListing = async (id) => {
    await supabase.from('listings').update({ status: 'rejected' }).eq('id', id);
    await loadAdminData();
  };

  if (!isModerator) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 60 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 16 }}>غير مصرح</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>هذه الصفحة للمشرفين فقط</p>
    </div>
  );

  const catStats = CATEGORIES.map(cat => ({
    name: cat.label, value: listings.filter(l => l.category === cat.id).length
  })).filter(c => c.value > 0);

  // Tabs available per role
  const tabs = [
    { id: 'moderation', label: `مراجعة الإعلانات ${pendingListings.length > 0 ? `(${pendingListings.length})` : ''}`, roles: ['admin', 'moderator'] },
    { id: 'listings', label: 'كل الإعلانات', roles: ['admin', 'moderator'] },
    { id: 'users', label: 'إدارة المستخدمين', roles: ['admin'] },
    { id: 'overview', label: 'الإحصائيات', roles: ['admin'] },
    { id: 'profit', label: 'الأرباح', roles: ['admin'] },
  ].filter(t => t.roles.includes(role));

  return (
    <div className="page-enter" style={{ padding: '24px 0 60px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24 }}>
              {isAdmin ? '⚡ لوحة الإدارة' : '🛡 لوحة المشرف'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              {isAdmin ? 'صلاحيات كاملة' : 'مراجعة الإعلانات وإدارة المحتوى'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tabs.map(t => (
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

        {/* KPIs — admin only */}
        {isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { icon: '📋', label: 'إعلانات نشطة', value: listings.length, color: 'var(--brand-primary)' },
              { icon: '⏳', label: 'قيد المراجعة', value: pendingListings.length, color: '#e65100' },
              { icon: '👥', label: 'المستخدمون', value: stats?.totalUsers || 0, color: '#2a4a8a' },
              { icon: '👁', label: 'المشاهدات', value: (stats?.totalViews || 0).toLocaleString('en-US'), color: '#6a1b9a' },
            ].map(k => (
              <div key={k.label} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 18, boxShadow: 'var(--shadow-sm)', borderTop: `3px solid ${k.color}` }}>
                <div style={{ fontSize: 24 }}>{k.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, color: k.color, marginTop: 6 }}>{k.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* MODERATION TAB */}
        {tab === 'moderation' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
              إعلانات تنتظر الموافقة
            </h3>
            {pendingListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ fontFamily: 'var(--font-body)' }}>لا توجد إعلانات تنتظر المراجعة</p>
              </div>
            ) : pendingListings.map(l => (
              <PendingCard key={l.id} listing={l}
                rejectId={rejectId} setRejectId={setRejectId}
                rejectReason={rejectReason} setRejectReason={setRejectReason}
                onApprove={() => approveListing(l.id)}
                onReject={() => { rejectListing(l.id, rejectReason); setRejectId(null); setRejectReason(''); }}
              />
            ))}
          </div>
        )}

        {/* ALL LISTINGS TAB */}
        {tab === 'listings' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>كل الإعلانات النشطة</h3>
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8f8f8' }}>
                    {['العنوان', 'الفئة', 'السعر', 'الموقع', 'المشاهدات', 'الحالة', 'إجراء'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.slice(0, 50).map((l, i) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? '#fafafa' : 'white' }}>
                      <td style={{ padding: '10px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', color: 'var(--brand-primary)' }}
                        onClick={() => { setSelectedListing(l); setPage('listing-detail'); }}>{l.title}</td>
                      <td style={{ padding: '10px 12px' }}><span className="badge badge-green">{CATEGORIES.find(c => c.id === l.category)?.label}</span></td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--brand-primary)' }}>{l.price?.toLocaleString('en-US')} {l.currency === 'USD' ? '$' : 'ل.س'}</td>
                      <td style={{ padding: '10px 12px' }}>{l.location}</td>
                      <td style={{ padding: '10px 12px' }}>👁 {l.views}</td>
                      <td style={{ padding: '10px 12px' }}><span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-orange'}`}>{l.status === 'active' ? 'نشط' : 'معلق'}</span></td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => deleteListing(l.id)} style={{
                          background: '#ffebee', color: '#c62828', border: 'none',
                          padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                          fontFamily: 'var(--font-body)', fontSize: 12
                        }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB — admin only */}
        {tab === 'users' && isAdmin && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>إدارة المستخدمين</h3>
            {usersLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>⏳ جاري التحميل...</div>
            ) : (
              <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8' }}>
                      {['الاسم', 'البريد الإلكتروني', 'الدور الحالي', 'تغيير الدور', 'إجراء'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? '#fafafa' : 'white' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.name || '—'}</td>
                        <td style={{ padding: '10px 12px', direction: 'ltr', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <RoleBadge role={u.role} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {u.email !== 'drmnana@gmail.com' && (
                            <select
                              value={u.role || 'user'}
                              onChange={e => updateRole(u.id, e.target.value)}
                              disabled={roleUpdating === u.id}
                              style={{
                                padding: '6px 10px', fontSize: 12, width: 'auto',
                                borderColor: 'var(--border)', cursor: 'pointer'
                              }}>
                              <option value="user">مستخدم عادي</option>
                              <option value="moderator">مشرف محتوى</option>
                              <option value="admin">مدير كامل</option>
                              <option value="blocked">محظور</option>
                            </select>
                          )}
                          {roleUpdating === u.id && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 6 }}>⏳</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {u.email !== 'drmnana@gmail.com' && u.role !== 'blocked' && (
                            <button onClick={() => blockUser(u.id)} disabled={blockingId === u.id}
                              style={{
                                background: '#fff3e0', color: '#e65100', border: 'none',
                                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                fontFamily: 'var(--font-body)', fontSize: 12
                              }}>
                              {blockingId === u.id ? '⏳' : '🚫 حظر'}
                            </button>
                          )}
                          {u.role === 'blocked' && (
                            <button onClick={() => updateRole(u.id, 'user')}
                              style={{
                                background: '#e8f5ee', color: 'var(--brand-primary)', border: 'none',
                                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                fontFamily: 'var(--font-body)', fontSize: 12
                              }}>رفع الحظر</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              * تغيير الدور يسري فور تسجيل المستخدم للدخول من جديد
            </p>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ChartCard title="نمو الإعلانات">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats?.quarterlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="quarter" style={{ fontFamily: 'var(--font-body)', fontSize: 11 }} />
                  <YAxis /><Tooltip formatter={v => [v, 'إعلان']} />
                  <Area type="monotone" dataKey="listings" stroke="var(--brand-primary)" fill="#e8eef8" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="توزيع الفئات">
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
          </div>
        )}

        {/* PROFIT TAB */}
        {tab === 'profit' && isAdmin && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, var(--bg-dark), #1a2e5a)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24, color: 'white' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>خطة التحقيق والأرباح</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
                {[
                  { label: 'مرحلة مجانية', value: 'سنة كاملة', sub: 'لبناء الجمهور' },
                  { label: 'الإعلانات الحالية', value: listings.length, sub: 'إعلان نشط' },
                  { label: 'إيراد متوقع (سنة 2)', value: `$${(listings.length * 15 * 0.3 * 12).toLocaleString('en-US')}`, sub: 'بنسبة تحويل 30%' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--brand-accent)' }}>{s.value}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <ChartCard title="توقع نمو الإيرادات">
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
                  <Area yAxisId="l" type="monotone" dataKey="إعلانات" stroke="var(--brand-primary)" fill="#e8eef8" strokeWidth={2} />
                  <Area yAxisId="r" type="monotone" dataKey="إيراد" stroke="var(--brand-accent)" fill="#fff8e0" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingCard({ listing, rejectId, setRejectId, rejectReason, setRejectReason, onApprove, onReject }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 14, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {listing.images?.[0] && (
        <img src={listing.images[0]} alt="" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{listing.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          📍 {listing.location} &nbsp;|&nbsp; 💰 {listing.price?.toLocaleString('en-US')} {listing.currency === 'USD' ? '$' : 'ل.س'} &nbsp;|&nbsp; 👤 {listing.profiles?.name || listing.seller_name}
        </div>
        <div style={{ fontSize: 12, color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.description}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button onClick={onApprove} style={{
          background: 'var(--brand-primary)', color: 'white', border: 'none',
          padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13
        }}>✅ موافقة</button>
        {rejectId === listing.id ? (
          <div>
            <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="سبب الرفض..." style={{ marginBottom: 6, fontSize: 13 }} />
            <button onClick={onReject} style={{
              background: '#c62828', color: 'white', border: 'none',
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', width: '100%', fontFamily: 'var(--font-body)', fontSize: 13
            }}>تأكيد الرفض</button>
          </div>
        ) : (
          <button onClick={() => setRejectId(listing.id)} style={{
            background: 'white', color: '#c62828', border: '1px solid #c62828',
            padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13
          }}>❌ رفض</button>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: { bg: '#e8eef8', color: '#1a2e5a', label: '⚡ مدير' },
    moderator: { bg: '#e8f5ee', color: '#0f6e56', label: '🛡 مشرف' },
    user: { bg: '#f5f5f5', color: '#555', label: 'مستخدم' },
    blocked: { bg: '#ffebee', color: '#c62828', label: '🚫 محظور' },
  };
  const s = styles[role] || styles.user;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
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
