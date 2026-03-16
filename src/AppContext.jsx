import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase, authService, listingService, adminService,
  DEMO_LISTINGS, CATEGORIES, SYRIAN_CITIES
} from './lib/supabase';

export { CATEGORIES, SYRIAN_CITIES };

const AppContext = createContext(null);

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pendingListings, setPendingListings] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (IS_DEMO) {
      const saved = localStorage.getItem('demo_user');
      if (saved) { const u = JSON.parse(saved); setUser(u); setProfile(u); }
      setAuthLoading(false);
      return;
    }
    authService.getSession().then(async session => {
      if (session) { setUser(session.user); await loadProfile(session.user.id); }
      setAuthLoading(false);
    });
    const { data: { subscription } } = authService.onAuthChange(async (event, session) => {
      if (session) { setUser(session.user); await loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const applyDemoFilters = useCallback(() => {
    let filtered = [...DEMO_LISTINGS];
    if (selectedCategory !== 'all') filtered = filtered.filter(l => l.category === selectedCategory);
    if (selectedCity !== 'all') filtered = filtered.filter(l => l.location.includes(selectedCity));
    if (searchQuery) filtered = filtered.filter(l =>
      l.title.includes(searchQuery) || l.description?.includes(searchQuery) || l.location.includes(searchQuery));
    if (sortBy === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    else if (sortBy === 'price-desc') filtered.sort((a,b) => b.price - a.price);
    else if (sortBy === 'views') filtered.sort((a,b) => b.views - a.views);
    else filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    setListings(filtered);
    setTotalCount(filtered.length);
    setFeaturedListings(DEMO_LISTINGS.filter(l => l.featured));
  }, [selectedCategory, selectedCity, searchQuery, sortBy]);

  const loadListings = useCallback(async () => {
    if (IS_DEMO) { applyDemoFilters(); return; }
    setListingsLoading(true);
    try {
      const { data, count } = await listingService.getAll({
        category: selectedCategory, city: selectedCity,
        search: searchQuery, sortBy, page, pageSize: 24
      });
      setListings(data || []);
      setTotalCount(count || 0);
    } catch { applyDemoFilters(); }
    finally { setListingsLoading(false); }
  }, [selectedCategory, selectedCity, searchQuery, sortBy, page, applyDemoFilters]);

  useEffect(() => { loadListings(); }, [loadListings]);

  useEffect(() => {
    if (IS_DEMO) { setFeaturedListings(DEMO_LISTINGS.filter(l => l.featured)); return; }
    listingService.getFeatured().then(data => setFeaturedListings(data || []));
  }, []);

  const login = async (email, password) => {
    if (IS_DEMO) {
      const isAdmin = email.includes('admin');
      const u = { id: '1', email, name: isAdmin ? 'المدير' : 'مستخدم تجريبي', role: isAdmin ? 'admin' : 'user', phone: '' };
      setUser(u); setProfile(u); localStorage.setItem('demo_user', JSON.stringify(u)); return;
    }
    await authService.signIn({ email, password });
  };

  const register = async ({ email, password, name, phone }) => {
    if (IS_DEMO) {
      const u = { id: Date.now().toString(), email, name, phone, role: 'user' };
      setUser(u); setProfile(u); localStorage.setItem('demo_user', JSON.stringify(u)); return;
    }
    await authService.signUp({ email, password, name, phone });
  };

  const logout = async () => {
    if (IS_DEMO) { localStorage.removeItem('demo_user'); setUser(null); setProfile(null); return; }
    await authService.signOut();
  };

  const addListing = async (listingData) => {
    if (IS_DEMO) {
      const newListing = {
        id: Date.now().toString(), ...listingData,
        user_id: user?.id, profiles: { name: profile?.name || 'مستخدم', phone: listingData.contact },
        created_at: new Date().toISOString(), views: 0, status: 'pending'
      };
      DEMO_LISTINGS.unshift(newListing); applyDemoFilters(); return newListing;
    }
    return await listingService.create(listingData);
  };

  const incrementViews = async (id) => {
    if (IS_DEMO) { const l = DEMO_LISTINGS.find(x => x.id === id); if (l) l.views = (l.views||0)+1; return; }
    await listingService.incrementViews(id);
  };

  const loadAdminData = async () => {
    if (IS_DEMO) {
      setPendingListings(DEMO_LISTINGS.filter(l => l.status === 'pending'));
      setStats({
        totalListings: DEMO_LISTINGS.length, totalUsers: 47,
        totalViews: DEMO_LISTINGS.reduce((s,l) => s+(l.views||0), 0),
        quarterlyData: [
          { quarter: 'Q1 2025', listings: 12, users: 8 },
          { quarter: 'Q2 2025', listings: 28, users: 23 },
          { quarter: 'Q3 2025', listings: 45, users: 41 },
          { quarter: 'Q4 2025', listings: 89, users: 76 },
          { quarter: 'Q1 2026', listings: 143, users: 124 },
        ]
      });
      return;
    }
    const [pending, s] = await Promise.all([adminService.getPendingListings(), adminService.getStats()]);
    setPendingListings(pending || []);
    setStats({ ...s, quarterlyData: buildQuarterlyData(s.recentListings || []) });
  };

  const approveListing = async (id) => {
    if (IS_DEMO) {
      const l = DEMO_LISTINGS.find(x => x.id === id);
      if (l) { l.status = 'active'; applyDemoFilters(); }
      setPendingListings(p => p.filter(x => x.id !== id)); return;
    }
    await adminService.approveListing(id);
    setPendingListings(p => p.filter(l => l.id !== id));
    loadListings();
  };

  const rejectListing = async (id, reason) => {
    if (IS_DEMO) { setPendingListings(p => p.filter(x => x.id !== id)); return; }
    await adminService.rejectListing(id, reason);
    setPendingListings(p => p.filter(l => l.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, profile, authLoading, isDemo: IS_DEMO,
      login, register, logout,
      listings, featuredListings, totalCount, listingsLoading, loadListings,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      selectedCity, setSelectedCity,
      sortBy, setSortBy, page, setPage,
      addListing, incrementViews,
      pendingListings, stats, loadAdminData, approveListing, rejectListing,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function buildQuarterlyData(listings) {
  const quarters = {};
  listings.forEach(l => {
    const d = new Date(l.created_at);
    const q = `Q${Math.ceil((d.getMonth()+1)/3)} ${d.getFullYear()}`;
    if (!quarters[q]) quarters[q] = { quarter: q, listings: 0 };
    quarters[q].listings++;
  });
  return Object.values(quarters).slice(-6);
}

export const useApp = () => useContext(AppContext);
