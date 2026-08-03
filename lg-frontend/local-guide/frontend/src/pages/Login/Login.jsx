import "./Login.css";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await login(email, password);

      localStorage.setItem(
        "token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>

        <h1>Login</h1>

        {location.state?.message && (
          <p className="login-success">{location.state.message}</p>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button type="submit">
          Login
        </button>

        <p className="login-register-link">
          New to Local Guide? <Link to="/register">Create an account</Link>
        </p>

      </form>
    </div>
  );
}

export default Login;
