import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase env vars missing — running in demo mode');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authService = {
  async signUp({ email, password, name, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone } }
    });
    if (error) throw error;
    // Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, name, phone, email, role: 'user'
      });
    }
    return data;
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ─── LISTINGS ─────────────────────────────────────────────────────────────────
export const listingService = {
  async getAll({ category, city, search, sortBy, page = 1, pageSize = 24 } = {}) {
    let query = supabase
      .from('listings')
      .select('*, profiles(name, phone)', { count: 'exact' })
      .eq('status', 'active');

    if (category && category !== 'all') query = query.eq('category', category);
    if (city && city !== 'all') query = query.ilike('location', `%${city}%`);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    if (sortBy === 'price-asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });
    else if (sortBy === 'views') query = query.order('views', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    // Pagination
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(name, phone, email)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    return data;
  },

  async create(listingData) {
    const session = await authService.getSession();
    if (!session) throw new Error('يجب تسجيل الدخول أولاً');

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        user_id: session.user.id,
        status: 'pending', // Goes to moderation queue
        views: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async incrementViews(id) {
    await supabase.rpc('increment_views', { listing_id: id });
  },

  async getUserListings(userId) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// ─── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
export const storageService = {
  async uploadImage(file, folder = 'listings') {
    const session = await authService.getSession();
    if (!session) throw new Error('يجب تسجيل الدخول أولاً');

    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${session.user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async deleteImage(url) {
    const path = url.split('/listing-images/')[1];
    if (!path) return;
    await supabase.storage.from('listing-images').remove([path]);
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminService = {
  async getPendingListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async approveListing(id) {
    return listingService.update(id, { status: 'active' });
  },

  async rejectListing(id, reason) {
    return listingService.update(id, { status: 'rejected', reject_reason: reason });
  },

  async getStats() {
    const [listings, users, views] = await Promise.all([
      supabase.from('listings').select('id, category, created_at, status', { count: 'exact' }),
      supabase.from('profiles').select('id, created_at', { count: 'exact' }),
      supabase.from('listings').select('views').eq('status', 'active')
    ]);

    const totalViews = views.data?.reduce((s, l) => s + (l.views || 0), 0) || 0;

    return {
      totalListings: listings.count || 0,
      totalUsers: users.count || 0,
      totalViews,
      listingsByCategory: listings.data || [],
      recentListings: listings.data?.slice(-30) || []
    };
  }
};

// ─── CATEGORIES & CONSTANTS ───────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'real-estate', label: 'عقارات', icon: '🏠', color: '#1a5f3f',
    subcategories: ['شقة', 'فيلا', 'أرض', 'محل تجاري', 'مكتب', 'مستودع'] },
  { id: 'cars', label: 'سيارات', icon: '🚗', color: '#1565c0',
    subcategories: ['سيدان', 'SUV', 'بيكأب', 'فان', 'دراجة نارية'] },
  { id: 'electronics', label: 'إلكترونيات', icon: '📱', color: '#6a1b9a',
    subcategories: ['هواتف', 'لابتوب', 'تلفزيون', 'كاميرات', 'أجهزة منزلية'] },
  { id: 'furniture', label: 'أثاث', icon: '🛋️', color: '#e65100',
    subcategories: ['غرف نوم', 'صالون', 'مطبخ', 'مكتبي', 'متنوع'] },
  { id: 'jobs', label: 'وظائف', icon: '💼', color: '#00838f',
    subcategories: ['هندسة', 'تجارة', 'تعليم', 'صحة', 'تقنية', 'عمال'] },
  { id: 'services', label: 'خدمات', icon: '🔧', color: '#558b2f',
    subcategories: ['نقل', 'تصليح', 'تنظيف', 'بناء', 'تصميم'] },
  { id: 'fashion', label: 'ملابس وأزياء', icon: '👗', color: '#ad1457',
    subcategories: ['رجالي', 'نسائي', 'أطفال', 'إكسسوارات'] },
  { id: 'other', label: 'متنوعات', icon: '📦', color: '#546e7a',
    subcategories: ['متنوع'] }
];

export const SYRIAN_CITIES = [
  'دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'دير الزور',
  'الرقة', 'السويداء', 'درعا', 'إدلب', 'القنيطرة', 'الحسكة'
];

// ─── DEMO / FALLBACK DATA ─────────────────────────────────────────────────────
export const DEMO_LISTINGS = [
  {
    id: '1', category: 'real-estate', subcategory: 'شقة',
    title: 'شقة فاخرة في قلب دمشق - حي المزة',
    description: 'شقة واسعة مع إطلالة رائعة، 3 غرف نوم، صالة كبيرة، مطبخ حديث، موقع مميز.',
    price: 45000, currency: 'USD', location: 'دمشق - المزة',
    area: 150, rooms: 3, bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
    contact: '+963 911 234 567', profiles: { name: 'أحمد الخطيب', phone: '+963 911 234 567' },
    created_at: new Date(Date.now() - 2*86400000).toISOString(), views: 234, status: 'active', featured: true
  },
  {
    id: '2', category: 'cars', subcategory: 'سيدان',
    title: 'تويوتا كامري 2019 - حالة ممتازة',
    description: 'سيارة بحالة ممتازة، صيانة دورية منتظمة، لون أبيض لؤلؤي، كافة الإضافات.',
    price: 18500, currency: 'USD', location: 'دمشق',
    year: 2019, mileage: 45000, color: 'أبيض',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600'],
    contact: '+963 955 111 222', profiles: { name: 'محمد الأحمد' },
    created_at: new Date(Date.now() - 1*86400000).toISOString(), views: 312, status: 'active', featured: true
  },
  {
    id: '3', category: 'real-estate', subcategory: 'فيلا',
    title: 'فيلا مستقلة في ضواحي حلب',
    description: 'فيلا فاخرة بمساحة واسعة مع حديقة خاصة ومسبح.',
    price: 120000, currency: 'USD', location: 'حلب - الحمدانية',
    area: 350, rooms: 5, bathrooms: 4,
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'],
    contact: '+963 944 876 543', profiles: { name: 'فاطمة النوري' },
    created_at: new Date(Date.now() - 5*86400000).toISOString(), views: 189, status: 'active', featured: true
  },
  {
    id: '4', category: 'electronics', subcategory: 'هواتف',
    title: 'آيفون 15 برو ماكس - 256GB',
    description: 'آيفون 15 برو ماكس بحالة ممتازة، مع الكرتون الأصلي، بطارية 95%.',
    price: 1200, currency: 'USD', location: 'دمشق',
    images: ['https://images.unsplash.com/photo-1696446701796-da61339945d0?w=600'],
    contact: '+963 988 333 444', profiles: { name: 'ريم الحسن' },
    created_at: new Date(Date.now() - 4*86400000).toISOString(), views: 445, status: 'active', featured: false
  },
  {
    id: '5', category: 'cars', subcategory: 'SUV',
    title: 'كيا سبورتاج 2021 - فضي معدني',
    description: 'كيا سبورتاج نظيفة جداً، ماشية 28 ألف كم فقط، لا حوادث.',
    price: 24000, currency: 'USD', location: 'اللاذقية',
    year: 2021, mileage: 28000, color: 'فضي',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600'],
    contact: '+963 933 456 789', profiles: { name: 'سمير العلي' },
    created_at: new Date(Date.now() - 3*86400000).toISOString(), views: 267, status: 'active', featured: true
  },
  {
    id: '6', category: 'furniture', subcategory: 'غرف نوم',
    title: 'غرفة نوم كاملة - خشب زان طبيعي',
    description: 'غرفة نوم فاخرة من خشب الزان الطبيعي، سرير كينج، دولاب 6 أبواب.',
    price: 2800, currency: 'USD', location: 'حمص',
    images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600'],
    contact: '+963 922 654 321', profiles: { name: 'أم علي' },
    created_at: new Date(Date.now() - 7*86400000).toISOString(), views: 98, status: 'active', featured: false
  }
];
