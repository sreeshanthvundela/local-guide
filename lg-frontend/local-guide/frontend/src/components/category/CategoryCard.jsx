import "./CategoryCard.css";
function CategoryCard({ icon, title, count, color }) {
  return (
    <div
      className="category-card"
      style={{
        background: color,
      }}
    >
      <div className="category-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{count} Places Nearby</p>

      <span className="category-tag">
        🔥 Trending
      </span>
    </div>
  );
}

export default CategoryCard;