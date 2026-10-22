export type PrivacyLevel = "LOW" | "MEDIUM" | "HIGH";

export interface PrivacyAssessment {
  level: PrivacyLevel;
  score: number;
  signals: string[];
  requiresRestrictedRouting: boolean;
}

export function assessPrivacy(input: string): PrivacyAssessment {
  const text = input.toLowerCase();
  let score = 0;
  const signals: string[] = [];

  const highRiskSignals = [
    "api key",
    "secret key",
    "password",
    "access token",
    "private key",
    "credentials",
  ];

  const mediumRiskSignals = [
    "customer data",
    "user data",
    "production database",
    "internal repository",
    "proprietary",
    "confidential",
  ];

  for (const signal of highRiskSignals) {
    if (text.includes(signal)) {
      score += 4;
      signals.push(`Sensitive credential signal: ${signal}`);
    }
  }

  for (const signal of mediumRiskSignals) {
    if (text.includes(signal)) {
      score += 2;
      signals.push(`Sensitive context signal: ${signal}`);
    }
  }

  const boundedScore = Math.min(score, 10);

  if (boundedScore >= 6) {
    return {
      level: "HIGH",
      score: boundedScore,
      signals,
      requiresRestrictedRouting: true,
    };
  }

  if (boundedScore >= 2) {
    return {
      level: "MEDIUM",
      score: boundedScore,
      signals,
      requiresRestrictedRouting: true,
    };
  }

  return {
    level: "LOW",
    score: boundedScore,
    signals:
      signals.length > 0
        ? signals
        : ["No sensitive context signals detected."],
    requiresRestrictedRouting: false,
  };
}
