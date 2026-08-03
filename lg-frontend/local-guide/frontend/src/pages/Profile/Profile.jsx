import "./Profile.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../services/profileService";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    getProfile().then(setProfile).catch((err) => setError(err.message));
  }, [navigate]);

  function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (error) return <main className="profile-page"><p className="profile-message">{error}</p></main>;
  if (!profile) return <main className="profile-page"><p className="profile-message">Loading your profile…</p></main>;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</div>
        <div><p className="profile-kicker">YOUR ACCOUNT</p><h1>{profile.name}</h1><p>{profile.email}</p></div>
        <button className="logout-button" onClick={logOut}>Log out</button>
      </section>

      <section className="profile-overview">
        <div><strong>{profile.total_searches}</strong><span>searches made</span></div>
        <div><strong>{profile.recent_searches.length}</strong><span>recent searches</span></div>
      </section>

      <section className="recent-searches">
        <div className="profile-section-heading"><div><p className="profile-kicker">ACTIVITY</p><h2>Recent searches</h2></div><Link to="/search">New search</Link></div>
        {profile.recent_searches.length ? (
          <div className="recent-search-list">{profile.recent_searches.map((query, index) => <Link key={`${query}-${index}`} to={`/search?q=${encodeURIComponent(query)}`}>{query}</Link>)}</div>
        ) : <p className="profile-message">Your searches will appear here.</p>}
      </section>
    </main>
  );
}

export default Profile;
