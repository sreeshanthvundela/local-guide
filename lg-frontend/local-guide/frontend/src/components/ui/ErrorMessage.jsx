function ErrorMessage({ message }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#fee2e2",
        color: "#dc2626",
        borderRadius: "10px",
      }}
    >
      {message}
    </div>
  );
}

export default ErrorMessage;