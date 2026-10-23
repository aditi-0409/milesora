
import { useState } from "react";
import { testBackend } from "./api";

export default function BackendConnectionTest() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleTest() {
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const data = await testBackend();
            setMessage(data.message);
        } catch (err) {
            setError(err.message || "Could not connect to backend.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button onClick={handleTest} disabled={loading}>
                {loading ? "Testing..." : "Test Backend Connection"}
            </button>

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
