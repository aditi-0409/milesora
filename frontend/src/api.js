const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export async function testBackend() {
    const response = await fetch(`${API_BASE_URL}/api/test`);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
}