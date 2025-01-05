import { Span } from "../jaeger/trace";

export type SpanDetailsProps = {
  span: Span | undefined;
};

function SpanDetails(props: SpanDetailsProps) {
  return (
    <ul className="code">
      { props.span?.tags.map(tag => {
        return (<li key={tag.key}><b>{tag.key}</b>: <pre>{tag.value}</pre></li>);
      }) }
    </ul>
  );
}

export default SpanDetails;
