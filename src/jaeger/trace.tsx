export type Trace = {
  data: TraceData[],
}

export type TraceData = {
  processes: ProcessesMap,
  spans: Span[],
  traceId: string,
  warning: any
}

export type ProcessesMap = {
  [key: string] : Process
};

export type Process = {
  serviceName: string,
  tags: Field[],
}

export type Span = {
  duration: number,
  logs: any[],
  operationName: string,
  processID: string,
  references: SpanReference[],
  spanID: string,
  startTime: number,
  tags: Field[],
  traceId: string,
  warning: any
}

export type SpanReference = {
  refType: string;
  spanID: string;
}

export type Log = {
  fields: Field[];
  timestamp: number;
}

export type Field = {
  key: string;
  type: string;
  value: string;
}

function parseTrace(text: string) : Trace {
  var trace = JSON.parse(text);
  return trace;
}

function parseSingleTrace(text: string) : TraceData {
  const trace = parseTrace(text);
  if (trace.data.length !== 1)
    throw new Error("contains multiple traces");
  return trace.data[0];
}

export {
  parseTrace,
  parseSingleTrace
}
