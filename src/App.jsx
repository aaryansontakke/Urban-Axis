import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';


import Header           from './components/Header';
import Footer           from './components/Footer';
import PaymentPartners  from './components/payment';
import FloatingControls from './components/FloatingIcons';


import Herosection          from './components/Herosection';
import About                from './components/About';
import Tour                 from './components/Tour'; 
import HomeFeaturedPackages from './components/HomeFeaturedPackages';


import AboutPage   from './components/AboutPage';
import Blog        from './components/Blog';
import Services    from './components/Services';
import ContactUs   from './components/Contact';
import EnquiryPage from './components/enquery'; 


import CategoryPage          from './components/CategoryPage';
import PackageDetail         from './components/PackageDetail';
import { IndiaToursList }    from './components/IndiaToursPage';
import { InternationalList } from './components/InternationalToursPage';


import AdminLogin      from './components/admin/AdminLogin';
import AdminLayout     from './components/admin/AdminLayout';
import AdminDashboard  from './components/admin/AdminDashboard';
import AdminCategories from './components/admin/AdminCategories';
import AdminPackages   from './components/admin/AdminPackages';
import AdminEnquiries  from './components/admin/AdminEnquiries';
import ProtectedRoute  from './components/admin/ProtectedRoute';


import ImageUploader       from './components/admin/ImageUploader';
import AccommodationEditor from './components/admin/AccommodationEditor';
import AdminHeroSlider     from './components/admin/AdminHeroSlider';
import AdminFeaturedDestinations from './components/admin/AdminFeaturedDestinations';
import AdminPayments       from './components/admin/AdminPayments';




function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}


const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-white font-sans text-slate-800">
    <Header/>
    <main>{children}</main>
    <PaymentPartners/>
    <Footer/>
    <FloatingControls/>
  </div>
);



function App() {
  return (
    <Router>
      <ScrollToTop/>
      <Routes>

        
        <Route path="/admin" element={<AdminLogin/>}/>
        
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout/>
          </ProtectedRoute>
        }>
          <Route path="dashboard"     element={<AdminDashboard/>}/>
          <Route path="categories"    element={<AdminCategories/>}/>
          <Route path="packages"      element={<AdminPackages/>}/>
          <Route path="enquiries"     element={<AdminEnquiries/>}/>
          
          
          <Route path="uploader"      element={<ImageUploader/>}/>
          <Route path="accommodation" element={<AccommodationEditor/>}/>
          <Route path="hero-slider"    element={<AdminHeroSlider/>}/>
          <Route path="featured-tours" element={<AdminFeaturedDestinations/>}/>
          <Route path="payments"      element={<AdminPayments/>}/>
        </Route>

        
        {["/", "/home"].map((path) => (
          <Route 
            key={path}
            path={path} 
            element={
              <PublicLayout>
                <Herosection/>
                <About/>
                <Tour/>
                <HomeFeaturedPackages/>
              </PublicLayout>
            }
          />
        ))}

        
        <Route path="/about"    element={<PublicLayout><AboutPage/></PublicLayout>}/>
        <Route path="/blog"     element={<PublicLayout><Blog/></PublicLayout>}/>
        <Route path="/services" element={<PublicLayout><Services/></PublicLayout>}/>
        <Route path="/contact"  element={<PublicLayout><ContactUs/></PublicLayout>}/>
        
        
        <Route path="/enquery"  element={<PublicLayout><EnquiryPage/></PublicLayout>}/>

        
        
        <Route path="/tours/india"
          element={<PublicLayout><IndiaToursList/></PublicLayout>}/>
        <Route path="/tours/india/:slug"
          element={<PublicLayout><CategoryPage type="india"/></PublicLayout>}/>

        
        <Route path="/tours/international"
          element={<PublicLayout><InternationalList/></PublicLayout>}/>
        <Route path="/tours/international/:slug"
          element={<PublicLayout><CategoryPage type="international"/></PublicLayout>}/>

        
        <Route path="/package/:packageId"
          element={<PublicLayout><PackageDetail/></PublicLayout>}/>

      </Routes>
    </Router>
  );
}

export default App;