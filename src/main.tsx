import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, BrainCircuit, ShieldCheck,
  Gauge, CheckCircle2, AlertTriangle
} from "lucide-react";
import { classifyTask } from "./intelligence/routing/TaskClassifier";
import { assessComplexity } from "./intelligence/routing/ComplexityScorer";
import { assessPrivacy } from "./intelligence/routing/PrivacyAnalyzer";
import { routeTask } from "./intelligence/routing/ModelRouter";
import "./style.css";

function App() {
  const [input, setInput] = useState(
    "Summarize a TypeScript project and recommend improvements."
  );
  const [result, setResult] = useState<any>(null);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  const [telemetry, setTelemetry] = useState<any>(null);
  const [accessCode, setAccessCode] = useState("");
  const [nemotronLoading, setNemotronLoading] = useState(false);
  const [nemotronError, setNemotronError] = useState("");
  const [nemotronResult, setNemotronResult] = useState<any>(null);

  async function runNemotron() {
    if (!approved || !result || result.route.restricted) {
      setNemotronError("Approve an unrestricted workload first.");
      return;
    }

    setNemotronLoading(true);
    setNemotronError("");
    setNemotronResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-axiom-access-code": accessCode
        },
        body: JSON.stringify({ prompt: input })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nemotron request failed.");
      }

      setNemotronResult(data);
    } catch (error) {
      setNemotronError(
        error instanceof Error ? error.message : "Request failed."
      );
    } finally {
      setNemotronLoading(false);
    }
  }
  function analyze() {
    try {
      setError("");
      setApproved(false);
      setNemotronResult(null);

      const startedAt = performance.now();
      const task = classifyTask(input);
      const complexity = assessComplexity(input, task.type);
      const privacy = assessPrivacy(input);
      const route = routeTask(input);

      const durationMs = performance.now() - startedAt;

      const recommendations: string[] = [];

      if (complexity.level === "HIGH") {
        recommendations.push(
          "Consider splitting this workload into smaller tasks."
        );
      }

      if (privacy.requiresRestrictedRouting) {
        recommendations.push(
          "Keep sensitive content out of hosted model requests."
        );
      }

      if (durationMs > 100) {
        recommendations.push(
          "Review local analysis performance."
        );
      }

      if (recommendations.length === 0) {
        recommendations.push(
          "No immediate local routing improvements identified."
        );
      }

      setTelemetry({
        durationMs: Number(durationMs.toFixed(2)),
        mode: "LOCAL_ANALYSIS",
        apiCalls: 0,
        recommendations
      });

      setResult({ task, complexity, privacy, route });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <main>
      <header>
        <div className="brand">AXIOM <span>AI CONTROL PLANE</span></div>
        <div className="status">LOCAL MODE · NO API CHARGES</div>
      </header>

      <section className="hero">
        <div className="eyebrow">TIERRA AI LABS · NEMOTRON EDITION</div>
        <h1>Intelligent AI Workload Control</h1>
        <p>
          Classify workloads, evaluate privacy, recommend model
          routing, and require human approval before changes.
        </p>
      </section>

      <section className="panel">
        <h2><BrainCircuit size={20}/> Workload Analysis</h2>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setApproved(false);
      setNemotronResult(null);
            setNemotronResult(null);
          }}
          rows={5}
        />
        <button onClick={analyze}>Analyze Workload</button>
        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <>
          <section className="metrics">
            <div className="metric">
              <Activity/>
              <small>Task Classification</small>
              <strong>{JSON.stringify(result.task)}</strong>
            </div>
            <div className="metric">
              <Gauge/>
              <small>Complexity</small>
              <strong>{JSON.stringify(result.complexity)}</strong>
            </div>
            <div className="metric">
              <ShieldCheck/>
              <small>Privacy Assessment</small>
              <strong>{JSON.stringify(result.privacy)}</strong>
            </div>
          </section>

          <section className="panel">
            <h2><BrainCircuit size={20}/> Proposed Model Routing</h2>
            <pre>{JSON.stringify(result.route, null, 2)}</pre>
            {result.route.restricted && (
              <p className="error">
                <AlertTriangle size={16}/>
                Hosted execution restricted by privacy policy.
              </p>
            )}
          </section>

          {telemetry && (
            <section className="panel">
              <h2><Activity size={20}/> Local Telemetry</h2>

              <p>
                Analysis duration: {telemetry.durationMs} ms
              </p>

              <p>
                Execution mode: {telemetry.mode}
              </p>

              <p>
                Nebius API calls: {telemetry.apiCalls}
              </p>

              <h2>Optimization Recommendations</h2>

              <ul>
                {telemetry.recommendations.map(
                  (recommendation: string, index: number) => (
                    <li key={index}>{recommendation}</li>
                  )
                )}
              </ul>

              <p>
                These recommendations are based on local rules,
                not measured Nebius model performance.
              </p>
            </section>
          )}

          <section className="panel">
            <h2><ShieldCheck size={20}/> Human Approval</h2>
            <p>
              Review the proposed routing decision before approving.
              Approval does not execute an API request.
            </p>
            <button
              disabled={result.route.restricted || approved}
              onClick={() => setApproved(true)}
            >
              {approved ? "Approved Locally" : "Approve Proposed Route"}
            </button>
            {approved && (
              <p className="success">
                <CheckCircle2 size={16}/>
                Local approval recorded for this session.
              </p>
            )}
          </section>
          <section className="panel">
            <h2><BrainCircuit size={20}/> NVIDIA Nemotron Execution</h2>
            <p>
              Analyze and approve the workload before live execution.
              Live requests may consume Nebius credits.
            </p>

            <input
              type="password"
              placeholder="Private access code"
              autoComplete="off"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />

            <button
              onClick={runNemotron}
              disabled={!approved || result.route.restricted || nemotronLoading}
            >
              {nemotronLoading ? "Running..." : "Run NVIDIA Nemotron"}
            </button>

            {nemotronError && <p className="error">{nemotronError}</p>}

            {nemotronResult && (
              <div>
                <p className="success">Live inference completed.</p>
                <p>Model: {nemotronResult.model}</p>
                <p>Latency: {nemotronResult.latencyMs} ms</p>
                <h3>Nemotron Response</h3>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {nemotronResult.output}
                </pre>
              </div>
            )}
          </section>
        </>
      )}

      <footer>
        Axiom AI Control Plane · Tierra AI Labs ·
        Nebius × NVIDIA Hackathon 2026
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);






