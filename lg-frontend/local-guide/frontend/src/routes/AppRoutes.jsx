import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import MapPage from "../pages/Map/MapPage";
import Search from "../pages/Search/Search";
import BusinessDetails from "../pages/Business/BusinessDetails";
import Categories from "../pages/Categories/Categories";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import CategoryDetails from "../pages/CategoryDetails/CategoryDetails";
import DistanceCalculator from "../pages/DistanceCalculator/DistanceCalculator";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/distance" element={<DistanceCalculator />} />
      <Route path="/search" element={<Search />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/business/:id" element={<BusinessDetails />} />
      <Route
  path="/category/:name"
  element={<CategoryDetails />}
/>
    </Routes>
  );
}

export default AppRoutes;
