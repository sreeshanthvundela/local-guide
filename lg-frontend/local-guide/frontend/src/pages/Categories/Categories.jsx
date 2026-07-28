import "./Categories.css";
import { useNavigate } from "react-router-dom";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "restaurants",
      icon: "🍽",
      title: "Restaurants",
    },
    {
      name: "cafes",
      icon: "☕",
      title: "Cafes",
    },
    {
      name: "hospitals",
      icon: "🏥",
      title: "Hospitals",
    },
    {
      name: "pharmacy",
      icon: "💊",
      title: "Pharmacy",
    },
    {
      name: "hotels",
      icon: "🏨",
      title: "Hotels",
    },
    {
      name: "bus-stops",
      icon: "🚌",
      title: "Bus Stops",
    },
    {
      name: "schools",
      icon: "🏫",
      title: "Schools",
    },
    {
      name: "gyms",
      icon: "🏋️",
      title: "Gyms",
    },
  ];

  return (
    <div className="categories-page">
      <h1>Explore Categories</h1>

      <div className="categories-grid">
        {categories.map((item) => (
          <div
            key={item.name}
            className="category-box"
            onClick={() =>
              navigate(`/category/${item.name}`)
            }
          >
            <h2>{item.icon}</h2>

            <h3>{item.title}</h3>

            <p>View nearby places</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;