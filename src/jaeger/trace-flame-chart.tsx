import { FlameChartNode } from "flame-chart-js/.";
import { ProcessesMap, Span, TraceData } from "./trace";
import { unclutter } from "../flame-chart/flame-chart-utils";

export type EnrichedFlameChartNode = FlameChartNode & {
  sourceSpan: Span;
}

function buildFlameChart(trace: TraceData): FlameChartNode[] {
  const spansByParentId = new Map<string, Span[]>();
  let rootSpans: Span[] = [];
  trace.spans.forEach(span => {
    if (span.references.length !== 1 || span.references[0].refType !== 'CHILD_OF')
      rootSpans.push(span);
    else {
      var parentId = span.references[0].spanID;
      var childrenSpans = spansByParentId.get(parentId);
      if (childrenSpans === undefined) {
        childrenSpans = [];
        spansByParentId.set(parentId, childrenSpans);
      }
      childrenSpans.push(span);
    }
  });

  if (rootSpans.length === 0) {
    // missing root span, it has most likely not been closed properly
    var existingSpans = new Set<string>();
    trace.spans.forEach(span => {
      existingSpans.add(span.spanID);
    });
    var nodesWithMissingParent = [...spansByParentId.entries()].filter(entry => !existingSpans.has(entry[0])).flatMap(entry => entry[1]);
    rootSpans = nodesWithMissingParent;
  }

  var traceStartTime = Math.min(...rootSpans.map(span => span.startTime));
  const flameChartNodes = rootSpans.map(span => buildNode(span, spansByParentId, traceStartTime, trace.processes));

  flameChartNodes.forEach(flameChartNode => {
    unclutter(flameChartNode);
  });

  return flameChartNodes;
}

function buildNode(span: any, spansByParentId: Map<string, any[]>, traceStartTime: number, processes: ProcessesMap): EnrichedFlameChartNode {
  var childrenSpans = spansByParentId.get(span.spanID);
  var children: FlameChartNode[] = [];
  if (childrenSpans !== undefined) {
    childrenSpans.forEach(childSpan => children.push(buildNode(childSpan, spansByParentId, traceStartTime, processes)));
  }
  return {
    name: span.operationName,
    start: span.startTime / 1000 - traceStartTime / 1000,
    duration: span.duration / 1000,
    children: children,
    color: getSpanColor(span, processes),
    sourceSpan: span
  };
}

function getSpanColor(span: Span, processes: ProcessesMap): string {
  var processId = span.processID;
  var process = processes[processId];
  if (process !== undefined) {
    var serviceName = process.serviceName;
    if (serviceName === "audittrail-service-api") return '#8934A4';
    if (serviceName === "compute-api") return '#C86B73';
    if (serviceName === "dependency-orchestrator-api") return '#C68CCD';
    if (serviceName === "e2e-tests") return '#A1D6B2';
    if (serviceName === "import-worker-api") return '#A7B342';
    if (serviceName === "liveupdate-api") return '#6E69CC';
    if (serviceName === "registry-api") return '#FFCC02';
    if (serviceName === "usermanagement-api") return '#DD8451';
    if (serviceName === "workspace-api") return '#3A69B3';
    if (serviceName === "workspace-worker-api") return '#DD8451';
  }
  return '#B8B8B8';
}

export { buildFlameChart };
