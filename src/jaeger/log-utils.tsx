import { Log } from "./trace";

function isLogLine(log: Log): boolean {
  return getLogFormat(log) !== undefined;
}

function formatLogLine(log: Log): string {
  const format = getLogFormat(log);
  if (format === undefined)
    return "";

  const formmattingItems = getFormattingItems(log);
  var formatted = format;
  formmattingItems.forEach(item => {
    formatted = formatted.replace('{' + item.formatKey + '}', item.formatValue);
  });
  return formatted;
}

function getLogFormat(log: Log): string | undefined {
  return log.fields.find(f => f.key === "state.{OriginalFormat}")?.value;
}

type LogFormatItem = {
  formatKey: string;
  formatValue: string;
}

function getFormattingItems(log: Log): LogFormatItem[] {
  return log.fields.filter(f => f.key.startsWith("state.")).map(f => { return {
    formatKey: f.key.substring(6),
    formatValue: f.value
   } });
}

export {
  isLogLine,
  formatLogLine
}
