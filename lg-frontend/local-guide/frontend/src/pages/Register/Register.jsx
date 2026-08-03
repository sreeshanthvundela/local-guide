import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password);
      navigate("/login", {
        state: { message: "Account created. Please log in." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <p className="register-subtitle">Save your profile and personalize Local Guide.</p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <label htmlFor="register-name">Name</label>
        <input id="register-name" type="text" placeholder="Your name" value={name}
          onChange={(event) => setName(event.target.value)} autoComplete="name" required />

        <label htmlFor="register-email">Email</label>
        <input id="register-email" type="email" placeholder="you@example.com" value={email}
          onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />

        <label htmlFor="register-password">Password</label>
        <input id="register-password" type="password" placeholder="Create a password" value={password}
          onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="register-login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
