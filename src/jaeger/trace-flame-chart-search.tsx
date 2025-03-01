import { EnrichedFlameChartNode } from "./trace-flame-chart";
import { Span } from "./trace";

function search(rootNodes: EnrichedFlameChartNode[], text: string): EnrichedFlameChartNode[] {
  const matchingSpans: EnrichedFlameChartNode[] = [];

  rootNodes.forEach(rootNode => searchInternal(rootNode, text, matchingSpans));

  return matchingSpans;
}

function searchInternal(node: EnrichedFlameChartNode, text: string, matchingSpans: EnrichedFlameChartNode[]) {
  if (node.sourceSpan !== undefined && doesSpanMatch(node.sourceSpan, text))
    matchingSpans.push(node);

  node.children?.forEach(child => searchInternal(child as EnrichedFlameChartNode, text, matchingSpans));
}

function doesSpanMatch(span: Span, text: string): boolean {
  return span.operationName.includes(text) ||
    span.tags.some(tag => tag.key.includes(text) || tag.value.toString().includes(text)) ||
    span.logs.some(log => log.fields.some(logField => logField.key.includes(text) || logField.value.toString().includes(text)));
}

export {
  search
}
