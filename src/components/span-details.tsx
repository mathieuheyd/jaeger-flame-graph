import { Span } from "../jaeger/trace";

export type SpanDetailsProps = {
  span: Span | undefined;
};

function SpanDetails(props: SpanDetailsProps) {
  return (
    <ul>
      { props.span?.tags.map(tag => {
        return (<li>{tag.key}: {tag.value}</li>);
      }) }
    </ul>
  );
}

export default SpanDetails;
