import { ChangeEvent, useState } from "react";
import { EnrichedFlameChartNode } from "../jaeger/trace-flame-chart";
import { search } from "../jaeger/trace-flame-chart-search";

export type SearchBarProps = {
  nodesToSearch: EnrichedFlameChartNode[];
  focus: (node: EnrichedFlameChartNode) => void;
  close: () => void;
};

function SearchBar(props: SearchBarProps) {
  const [matches, setMatches] = useState<EnrichedFlameChartNode[] | undefined>(undefined);
  const [curentMatchIndex, setCurentMatchIndex] = useState<number>(0);

  function doSearch(event: ChangeEvent<HTMLInputElement>) {
    const newInput = event.target.value;
    if (newInput === "") {
      setMatches(undefined);
      setCurentMatchIndex(0);
      return;
    }

    const newMatches = search(props.nodesToSearch, newInput);
    setMatches(newMatches);
    setCurentMatchIndex(0);
    focus(newMatches, 0);
  }

  function previous() {
    if (matches === undefined)
      return;
    const newIndex = curentMatchIndex === 0 ? matches.length - 1 : curentMatchIndex - 1;
    setCurentMatchIndex(newIndex);
    focus(matches, newIndex);
  }

  function next() {
    if (matches === undefined)
      return;
    const newIndex = curentMatchIndex === matches.length - 1 ? 0 : curentMatchIndex + 1;
    setCurentMatchIndex(newIndex);
    focus(matches, newIndex);
  }

  function focus(allMatches: EnrichedFlameChartNode[], indexToFocus: number) {
    props.focus(allMatches[indexToFocus]);
  }

  return (
    <div className="searchBar">
      <span className="input">
        <input autoFocus type="text" onChange={doSearch}></input>
        {matches !== undefined &&
          <span>{matches.length === 0 ? 0 : curentMatchIndex + 1}/{matches.length}</span>
        }
      </span>
      <button className="previous" disabled={matches === undefined} onClick={previous}>
        <i className="fa fa-chevron-up" />
      </button>
      <button className="next" disabled={matches === undefined} onClick={next}>
        <i className="fa fa-chevron-down" />
      </button>
      <button onClick={props.close}>
        <i className="fa fa-times" />
      </button>
    </div>
  );
}

export default SearchBar;
