import React from 'react';
import logo from './logo.svg';
import './App.css';
import { FlameChartComponent } from 'flame-chart-js/react';

function App() {
  const flameChartData = [{
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

  return (
    <div className="App">
      <FlameChartComponent
        data={flameChartData}
        settings={settings}
        />
    </div>
  );
}

export default App;
