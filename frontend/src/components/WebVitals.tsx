"use client";
import { useEffect } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;

function report(metric: Metric) {
  const payload = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, id: metric.id, path: window.location.pathname });
  if (endpoint && navigator.sendBeacon) navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
  if (process.env.NODE_ENV === "development") console.debug("web-vital", JSON.parse(payload));
}

export default function WebVitals() {
  useEffect(() => {
    onCLS(report); onINP(report); onLCP(report); onFCP(report); onTTFB(report);
  }, []);
  return null;
}
