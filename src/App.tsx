import React, { useState } from 'react';
import { FlameChartNode } from 'flame-chart-js';
import { FlameChartComponent, NodeTypes } from 'flame-chart-js/react';
import { parseSingleTrace, Span } from './jaeger/trace';
import { buildFlameChart, EnrichedFlameChartNode } from './jaeger/trace-flame-chart';
import SpanDetails from './components/span-details';
import './App.css';

function App() {
  const [flameChartData, setFlameChartData] = useState<FlameChartNode[] | undefined>();
  const [selectedSpan, setSelectedSpan] = useState<Span | undefined>();

  const settings = {
    hotkeys: {
      active: true,  // enable navigation using arrow keys
      scrollSpeed: 0.5, // scroll speed (ArrowLeft, ArrowRight)
      zoomSpeed: 0.001, // zoom speed (ArrowUp, ArrowDown, -, +)
      fastMultiplayer: 5, // speed multiplier when zooming and scrolling (activated by Shift key)
    },
    options: {
      timeUnits: 'ms',
    }
  };

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    var selectedFiles = event.target.files;
    if (selectedFiles === null || selectedFiles.length === 0)
      return;

    var reader = new FileReader();
    reader.readAsText(selectedFiles[0], "UTF-8");
    reader.onload = function (progressEvent: ProgressEvent<FileReader>) {
      const trace = parseSingleTrace(progressEvent.target?.result as string);
      const flameChart = buildFlameChart(trace);
      setFlameChartData([flameChart]);
    }
    reader.onerror = function (error) {
        throw error;
    }
  }

  function onSelect(data: NodeTypes) {
    if (data?.type === 'flame-chart-node') {
      setSelectedSpan((data.node?.source as EnrichedFlameChartNode)?.sourceSpan);
    }
  }

  return (
    <div className="App">
      { flameChartData === undefined &&
        <input type="file" onChange={handleFileUpload} />
      }
      { flameChartData !== undefined &&
        <div>
          <FlameChartComponent
            data={flameChartData}
            settings={settings}
            className="flameChart"
            onSelect={onSelect}
          />
          <div className="spanDetails">
            <SpanDetails span={selectedSpan} />
          </div>
        </div>
      }
    </div>
  );
}

export default App;
