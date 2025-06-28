import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import AllBooks from './Pages/AllBooks'; // <-- Import AllBooks
import HomePage from './Pages/HomePage';
import LikedPage from './Pages/LikedPage';
import LoginSignup from './Pages/LoginSignup';
import Product from './Pages/Product';
import RecomendedPage from './Pages/RecomendedPage';

// import Footer from './Components/Footer/Footer'; // Uncomment if you have a Footer

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recomended" element={<RecomendedPage />} />
          <Route path="/liked" element={<LikedPage />} />
          <Route path="/loginsignup" element={<LoginSignup />} />
          <Route path="/allBooks" element={<AllBooks />} /> {/* <-- Add this line */}
          <Route path="/product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
        </Routes>
        {/* <Footer /> */}
      </BrowserRouter>
    </div>
  );
}

export default App;
