import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Offers from './pages/Offers.jsx';
import Orders from './pages/Orders.jsx';
import Prices from './pages/Prices.jsx';
import Layout from './components/Layout.jsx';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('keydash_token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="offers" element={<Offers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="prices" element={<Prices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
