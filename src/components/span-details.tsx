import { useState } from "react";
import { formatLogLine, isLogLine } from "../jaeger/log-utils";
import { Span } from "../jaeger/trace";

export type SpanDetailsProps = {
  span: Span | undefined;
};

enum Tab {
  Tags,
  Logs
}

type TabDetails = {
  type: Tab,
  name: string
}

function SpanDetails(props: SpanDetailsProps) {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Tags);

  const logLines = props.span?.logs.filter(isLogLine) ?? [];

  const tabs: TabDetails[] = props.span === undefined ? [] : [
    {type: Tab.Tags, name: `Tags (${props.span.tags.length})`},
    {type: Tab.Logs, name: `Logs (${logLines.length})`},
  ];

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    fractionalSecondDigits: 3
}

  return (
    <div className="spanDetails">
      <div className="tabs">
        {tabs.map(tab =>
          <span key={tab.type} className={selectedTab === tab.type ? 'tabSelected' : ''} onClick={() => setSelectedTab(tab.type)}>{tab.name}</span>
        )}
      </div>
      <div className="content">
        <ul className="code">
          { selectedTab === Tab.Tags && props.span?.tags.map((tag, i) => {
            return (<li key={i}><b>{tag.key}</b>: <pre>{tag.value}</pre></li>);
          }) }
          { selectedTab === Tab.Logs && logLines.map(log => {
            return (<li key={log.timestamp}><b>{new Date(log.timestamp / 1000).toLocaleString('en-US', dateFormatOptions)}</b>: <pre>{formatLogLine(log)}</pre></li>);
          }) }
        </ul>
      </div>
    </div>
  );
}

export default SpanDetails;
