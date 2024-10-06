type Trace = {
  data: TraceData[],
}

type TraceData = {
  processes: { [key: string] : Process },
  spans: Span[],
  traceId: string,
  warning: any
}

type Process = {
  serviceName: string,
  tags: any[],
}

type Span = {
  duration: number,
  logs: any[],
  operationName: string,
  processId: string,
  references: any[],
  spanID: string,
  startTime: number,
  tags: any[],
  traceId: string,
  warning: any
}

function parseTrace(text: string) : Trace {
  var trace = JSON.parse(text);
  throw trace;
}

function parseSingleTrace(text: string) : TraceData {
  const trace = parseTrace(text);
  if (trace.data.length !== 1)
    throw new Error("contains multiple traces");
  return trace.data[0];
}

export { parseTrace, parseSingleTrace }
