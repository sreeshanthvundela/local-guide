import "./Profile.css";

function Profile() {
  return (
    <div className="profile-page">

      <div className="profile-card">

        <img
          src="https://i.pravatar.cc/150"
          alt="profile"
        />

        <h2>Jaya Narasimha</h2>

        <p>Frontend Developer</p>

      </div>

      <div className="saved-section">

        <h3>Saved Places</h3>

        <div className="saved-card">
          ABC Restaurant
        </div>

        <div className="saved-card">
          XYZ Cafe
        </div>

      </div>

    </div>
  );
}

export default Profile;