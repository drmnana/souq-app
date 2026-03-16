import { useState } from 'react';
import { AppProvider } from './AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import NewListingPage from './pages/NewListingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import AdminDashboard from './pages/AdminDashboard';
import MyListingsPage from './pages/MyListingsPage';

function App() {
  const [page, setPage] = useState('home');
  const [selectedListing, setSelectedListing] = useState(null);

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage setPage={setPage} setSelectedListing={setSelectedListing} />;
      case 'listings': return <ListingsPage setPage={setPage} setSelectedListing={setSelectedListing} />;
      case 'listing-detail': return <ListingDetailPage listing={selectedListing} setPage={setPage} />;
      case 'new-listing': return <NewListingPage setPage={setPage} />;
      case 'login': return <LoginPage setPage={setPage} />;
      case 'register': return <RegisterPage setPage={setPage} />;
      case 'admin': return <AdminDashboard setPage={setPage} setSelectedListing={setSelectedListing} />;
      case 'my-listings': return <MyListingsPage setPage={setPage} setSelectedListing={setSelectedListing} />;
      default: return <HomePage setPage={setPage} setSelectedListing={setSelectedListing} />;
    }
  };

  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar page={page} setPage={setPage} />
        <main style={{ flex: 1 }}>{renderPage()}</main>
        <Footer setPage={setPage} />
      </div>
    </AppProvider>
  );
}
export default App;
