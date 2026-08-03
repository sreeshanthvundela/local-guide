import "./Categories.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../services/categoryService";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories({})).finally(() => setLoading(false));
  }, []);

  return (
    <main className="categories-page">
      <div className="categories-heading"><p className="section-kicker">LIVE DIRECTORY</p><h1>Explore categories</h1><p>Browse categories currently available in the Local Guide database.</p></div>
      {loading ? <p className="categories-message">Loading categories…</p> : Object.keys(categories).length === 0 ? <p className="categories-message">No saved categories yet. Use Search or Map to discover live places.</p> : (
        <div className="categories-grid">{Object.entries(categories).map(([name, count]) => <button className="category-box" key={name} onClick={() => navigate(`/category/${name}`)}><span>{name.replaceAll("_", " ")}</span><strong>{count}</strong><small>View nearby places</small></button>)}</div>
      )}
    </main>
  );
}

export default Categories;
