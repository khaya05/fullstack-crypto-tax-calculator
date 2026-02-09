import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Keep this console log: it’s the fastest way to debug blank pages in dev.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ padding: "2rem", color: "#b91c1c", fontFamily: "monospace" }}>
          <h1 style={{ marginTop: 0 }}>Application Error</h1>
          <p>{error.message}</p>
          {error.stack && (
            <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: "1rem", borderRadius: 8 }}>
              {error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}


