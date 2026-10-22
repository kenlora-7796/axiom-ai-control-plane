import type { AxiomTelemetryRecord } from "./TelemetryTypes.js";

const telemetryRecords: AxiomTelemetryRecord[] = [];

export function recordTelemetry(
  record: AxiomTelemetryRecord
): AxiomTelemetryRecord {
  telemetryRecords.push(record);
  return record;
}

export function getTelemetry(): AxiomTelemetryRecord[] {
  return [...telemetryRecords];
}

export function clearTelemetry(): void {
  telemetryRecords.length = 0;
}
