import { useState } from 'react';
import { useApp } from '../AppContext';

export function LoginPage({ setPage }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      setPage('home');
    } catch (e) {
      setError('بيانات الدخول غير صحيحة. تأكد من تفعيل بريدك الإلكتروني أولاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="أهلاً بعودتك إلى إعلانات+">
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormField label="البريد الإلكتروني">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="example@email.com" style={{ direction: 'ltr' }}/>
      </FormField>
      <FormField label="كلمة المرور">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="••••••••" style={{ direction: 'ltr' }}/>
      </FormField>
      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, opacity: loading ? 0.7 : 1 }}
        onClick={handleLogin} disabled={loading}>
        {loading ? '⏳ جاري الدخول...' : 'دخول →'}
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
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
      setDone(true);
    } catch (e) {
      setError('حدث خطأ: ' + (e.message || 'حاول مرة أخرى'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>📧</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, marginBottom: 16, color: 'var(--brand-primary)' }}>
            تحقق من بريدك الإلكتروني
          </h1>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-lg)', marginBottom: 24 }}>
            <p style={{ fontSize: 17, lineHeight: 2, color: 'var(--text-primary)', marginBottom: 16 }}>
              شكراً لتسجيلك في <strong>إعلانات+</strong>
            </p>
            <p style={{ fontSize: 15, lineHeight: 2, color: 'var(--text-secondary)', marginBottom: 20 }}>
              أرسلنا رسالة تفعيل إلى
              <br/>
              <strong style={{ color: 'var(--brand-primary)', direction: 'ltr', display: 'inline-block' }}>{form.email}</strong>
            </p>
            <div style={{ background: '#e8f5ee', border: '1px solid #c8e6d5', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: '#2e7d52', margin: 0 }}>
                ✅ افتح بريدك الإلكتروني<br/>
                ✅ ابحث عن رسالة من إعلانات+<br/>
                ✅ اضغط على رابط التفعيل<br/>
                ✅ عُد هنا وسجّل دخولك
              </p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              لم تصلك الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
            </p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }}
              onClick={() => setPage('login')}>
              الذهاب إلى صفحة الدخول →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout title="إنشاء حساب جديد" subtitle="انضم إلى إعلانات+ مجاناً">
      {error && <ErrorBox>{error}</ErrorBox>}
      <FormField label="الاسم الكامل *">
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="محمد أحمد" />
      </FormField>
      <FormField label="البريد الإلكتروني *">
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="example@email.com" style={{ direction: 'ltr' }}/>
      </FormField>
      <FormField label="رقم الهاتف">
        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+963 9XX XXX XXX" />
      </FormField>
      <FormField label="كلمة المرور *">
        <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
          placeholder="6 أحرف على الأقل" style={{ direction: 'ltr' }}/>
      </FormField>
      <button className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8, opacity: loading ? 0.7 : 1 }}
        onClick={handleRegister} disabled={loading}>
        {loading ? '⏳ جاري إنشاء الحساب...' : '🚀 إنشاء الحساب مجاناً'}
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
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 32, color: 'var(--brand-accent)', marginBottom: 8 }}>إعلانات+</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24 }}>{title}</h1>
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
