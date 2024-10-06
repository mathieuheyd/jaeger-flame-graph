import React, { useState } from 'react';
import { FlameChartNode } from 'flame-chart-js';
import { FlameChartComponent } from 'flame-chart-js/react';
import './App.css';
import { parseSingleTrace } from './jaeger/trace';

function App() {
  const [flameChartData, setFlameChartData] = useState<FlameChartNode[] | undefined>();

  const defaultFlameChart = [{
    name: 'foo',
    start: 300,
    duration: 200,
    type: 'task',
    children: [
        {
            name: 'foo',
            start: 310,
            duration: 50,
            type: 'sub-task',
            color: '#AA0000',
        },
    ],
  }];

  const settings = {
    hotkeys: {
      active: true,  // enable navigation using arrow keys
      scrollSpeed: 0.5, // scroll speed (ArrowLeft, ArrowRight)
      zoomSpeed: 0.001, // zoom speed (ArrowUp, ArrowDown, -, +)
      fastMultiplayer: 5, // speed multiplier when zooming and scrolling (activated by Shift key)
    },
    options: {
      tooltip: () => {
          /*...*/
      }, // see section "Custom Tooltip" below
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
      console.log(trace);
      setFlameChartData(defaultFlameChart);
    }
    reader.onerror = function (error) {
        throw error;
    }

    return [];
  }

  return (
    <div className="App">
      { flameChartData === undefined &&
        <input type="file" onChange={handleFileUpload} />
      }
      { flameChartData !== undefined &&
        <FlameChartComponent
          data={flameChartData}
          settings={settings}
        />
      }
    </div>
  );
}

export default App;
