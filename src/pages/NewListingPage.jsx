import { useState, useRef } from 'react';
import { useApp, CATEGORIES, SYRIAN_CITIES } from '../AppContext';
import { supabase } from '../lib/supabase';

export default function NewListingPage({ setPage }) {
  const { user, profile, addListing } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: '', subcategory: '', title: '', description: '',
    price: '', currency: 'USD', location: '',
    contact: profile?.phone || '', seller_name: profile?.name || '',
    listing_type: 'بيع', area: '', rooms: '', bathrooms: '',
    year: '', mileage: '', color: ''
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  if (!user) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 60, marginBottom: 20 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>تسجيل الدخول مطلوب</h2>
      <button className="btn-primary" onClick={() => setPage('login')}>تسجيل الدخول</button>
    </div>
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  const handleImageUpload = async (files) => {
    setUploading(true);
    setError('');
    const newUrls = [];
    for (const file of Array.from(files).slice(0, 5 - imageUrls.length)) {
      try {
        const ext = file.name.split('.').pop().toLowerCase();
        const fileName = `listings/${user.id}/${Date.now()}.${ext}`;
        const { data, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);
        newUrls.push(publicUrl);
      } catch (e) {
        console.error('Upload error:', e);
        setError('فشل رفع الصورة: ' + e.message);
      }
    }
    setImageUrls(prev => [...prev, ...newUrls]);
    setUploading(false);
  };

  const removeImage = (i) => setImageUrls(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.location || !form.contact) {
      setError('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    setError('');
    try {
      const toInt = (v) => v === '' || v === null || v === undefined ? null : parseInt(v);
      await addListing({
        ...form,
        price: parseFloat(form.price) || 0,
        area: toInt(form.area),
        rooms: toInt(form.rooms),
        bathrooms: toInt(form.bathrooms),
        year: toInt(form.year),
        mileage: toInt(form.mileage),
        images: imageUrls,
        user_id: user.id,
        seller_name: form.seller_name || profile?.name || '',
      });
      setSubmitted(true);
    } catch (e) {
      console.error('Submit error:', e);
      setError('حدث خطأ: ' + e.message);
    }
  };

  if (submitted) return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--brand-primary)', marginBottom: 12 }}>
        تم استلام إعلانك!
      </h2>
      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: 16, maxWidth: 400, margin: '0 auto 28px', fontSize: 14 }}>
        ⏳ إعلانك قيد المراجعة. سيظهر للعموم بعد موافقة الإدارة.
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => setPage('listings')}>عرض الإعلانات</button>
        <button className="btn-outline" onClick={() => {
          setSubmitted(false);
          setForm({ category:'', subcategory:'', title:'', description:'', price:'', currency:'USD', location:'', contact: profile?.phone||'', seller_name: profile?.name||'', listing_type:'بيع', area:'', rooms:'', bathrooms:'', year:'', mileage:'', color:'' });
          setImageUrls([]); setStep(1);
        }}>إضافة إعلان آخر</button>
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ padding: '30px 0 60px' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, marginBottom: 6 }}>إضافة إعلان جديد</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>مجاناً — نشر بعد المراجعة</p>

        <div style={{ display: 'flex', marginBottom: 30, gap: 4 }}>
          {['الفئة', 'التفاصيل والصور', 'السعر والتواصل'].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 4, background: i < step ? 'var(--brand-primary)' : '#e0e0e0', borderRadius: 2, marginBottom: 6, transition: 'background 0.3s' }}/>
              <span style={{ fontSize: 12, color: i < step ? 'var(--brand-primary)' : 'var(--text-muted)', fontWeight: i+1 === step ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-md)' }}>

          {step === 1 && (
            <div>
              <h3 style={stepTitle}>اختر فئة الإعلان</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => set('category', cat.id)} style={{
                    background: form.category === cat.id ? cat.color : '#f8f8f8',
                    border: `2px solid ${form.category === cat.id ? cat.color : '#e0e0e0'}`,
                    borderRadius: 12, padding: '16px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form.category === cat.id ? 'white' : 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{cat.label}</div>
                  </button>
                ))}
              </div>
              {selectedCat && (
                <FF label="الفئة الفرعية">
                  <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}>
                    <option value="">اختر...</option>
                    {selectedCat.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FF>
              )}
              <button className="btn-primary" disabled={!form.category} onClick={() => setStep(2)} style={{ opacity: form.category ? 1 : 0.5 }}>التالي →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={stepTitle}>تفاصيل الإعلان والصور</h3>
              <FF label="عنوان الإعلان *">
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: شقة للبيع في دمشق" />
              </FF>
              <FF label="وصف الإعلان *">
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="اكتب وصفاً تفصيلياً..." rows={5}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}/>
              </FF>

              {form.category === 'real-estate' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <FF label="المساحة (م²)"><input type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="150" /></FF>
                  <FF label="الغرف"><input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)} placeholder="3" /></FF>
                  <FF label="الحمامات"><input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="2" /></FF>
                </div>
              )}
              {form.category === 'cars' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <FF label="سنة الصنع"><input type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="2020" /></FF>
                  <FF label="المسافة (كم)"><input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="50000" /></FF>
                  <FF label="اللون"><input value={form.color} onChange={e => set('color', e.target.value)} placeholder="أبيض" /></FF>
                </div>
              )}

              <FF label={`الصور (${imageUrls.length}/5) — اختياري`}>
                <div onClick={() => !uploading && fileRef.current?.click()} style={{
                  border: '2px dashed var(--border)', borderRadius: 10, padding: '24px',
                  textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', background: '#fafafa', marginBottom: 12
                }}>
                  {uploading ? (
                    <div style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-body)' }}>⏳ جاري الرفع...</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                      <div style={{ fontWeight: 600, color: 'var(--brand-primary)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>اضغط لرفع الصور</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG أو PNG — حتى 5 صور</div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                  onChange={e => handleImageUpload(e.target.files)} />
                {imageUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {imageUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        <button onClick={() => removeImage(i)} style={{
                          position: 'absolute', top: -6, right: -6, background: 'red', color: 'white',
                          border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11
                        }}>✕</button>
                        {i === 0 && <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'var(--brand-primary)', color: 'white', fontSize: 9, padding: '1px 5px', borderRadius: 4 }}>رئيسية</div>}
                      </div>
                    ))}
                  </div>
                )}
              </FF>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-outline" onClick={() => setStep(1)}>← رجوع</button>
                <button className="btn-primary" disabled={!form.title || !form.description} onClick={() => setStep(3)} style={{ opacity: form.title && form.description ? 1 : 0.5 }}>التالي →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={stepTitle}>السعر ومعلومات التواصل</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
                <FF label="السعر *"><input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="50000" /></FF>
                <FF label="العملة">
                  <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                    <option value="USD">دولار</option>
                    <option value="SYP">ليرة سورية</option>
                  </select>
                </FF>
              </div>
              {form.category === 'real-estate' && (
                <FF label="نوع العرض">
                  <select value={form.listing_type} onChange={e => set('listing_type', e.target.value)}>
                    <option value="بيع">للبيع</option>
                    <option value="إيجار">للإيجار</option>
                  </select>
                </FF>
              )}
              <FF label="المحافظة *">
                <select value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">اختر المحافظة</option>
                  {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FF>
              <FF label="رقم التواصل / واتساب *">
                <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="+963 9XX XXX XXX" />
              </FF>
              <FF label="اسمك">
                <input value={form.seller_name} onChange={e => set('seller_name', e.target.value)} placeholder={profile?.name || ''} />
              </FF>

              {error && <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>⚠️ {error}</div>}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-outline" onClick={() => setStep(2)}>← رجوع</button>
                <button className="btn-accent" onClick={handleSubmit} style={{ flex: 1, justifyContent: 'center' }}>
                  🚀 نشر الإعلان
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const stepTitle = { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 20 };

function FF({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>{label}</label>
      {children}
    </div>
  );
}
