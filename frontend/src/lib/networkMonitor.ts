const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type NetworkStatus = { browserOnline: boolean; apiReachable: boolean; lastChecked: number };

class NetworkMonitor {
  private status: NetworkStatus = { browserOnline: true, apiReachable: true, lastChecked: Date.now() };
  private listeners = new Set<(status: NetworkStatus) => void>();

  constructor() {
    if (typeof window !== "undefined") {
      this.status.browserOnline = navigator.onLine;
      window.addEventListener("online", () => { this.status = { ...this.status, browserOnline: true }; this.notify(); void this.check(); });
      window.addEventListener("offline", () => { this.status = { ...this.status, browserOnline: false, apiReachable: false }; this.notify(); });
    }
  }

  async check(): Promise<boolean> {
    if (typeof window !== "undefined" && !navigator.onLine) return false;
    try {
      const response = await fetch(`${API_URL}/health/`, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(5000) });
      this.status = { browserOnline: true, apiReachable: response.ok, lastChecked: Date.now() };
    } catch {
      this.status = { browserOnline: typeof navigator === "undefined" ? true : navigator.onLine, apiReachable: false, lastChecked: Date.now() };
    }
    this.notify();
    return this.status.apiReachable;
  }

  subscribe(listener: (status: NetworkStatus) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  getStatus(): NetworkStatus { return { ...this.status }; }
  private notify(): void { this.listeners.forEach((listener) => listener(this.getStatus())); }
}

export const networkMonitor = new NetworkMonitor();
