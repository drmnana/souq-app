import { useState } from 'react';
import { useApp } from '../AppContext';

export function LoginPage({ setPage }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    const ok = login(email, password);
    if (ok) setPage('home');
    else setError('بيانات الدخول غير صحيحة');
  };

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="أهلاً بعودتك">
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormField label="البريد الإلكتروني">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" style={{ direction: 'ltr' }}/>
      </FormField>
      <FormField label="كلمة المرور">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ direction: 'ltr' }}/>
      </FormField>

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={handleLogin}>
        دخول →
      </button>
      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
        ليس لديك حساب؟{' '}
        <button onClick={() => setPage('register')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          إنشاء حساب جديد
        </button>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage({ setPage }) {
  const { register } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) { setError('يرجى ملء جميع الحقول المطلوبة'); return; }
    register(form);
    setPage('home');
  };

  return (
    <AuthLayout title="إنشاء حساب جديد" subtitle="انضم إلى سوق سوريا مجاناً">
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormField label="الاسم الكامل *">
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="محمد أحمد" />
      </FormField>
      <FormField label="البريد الإلكتروني *">
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" style={{ direction: 'ltr' }}/>
      </FormField>
      <FormField label="رقم الهاتف">
        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+963 9XX XXX XXX" />
      </FormField>
      <FormField label="كلمة المرور *">
        <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="8 أحرف على الأقل" style={{ direction: 'ltr' }}/>
      </FormField>
      <button className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }} onClick={handleRegister}>
        🚀 إنشاء الحساب مجاناً
      </button>
      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
        لديك حساب بالفعل؟{' '}
        <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          تسجيل الدخول
        </button>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🟡</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26 }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-lg)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{label}</label>
      {children}
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
      ⚠️ {children}
    </div>
  );
}
