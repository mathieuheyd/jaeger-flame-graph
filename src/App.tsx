import React, { useState } from 'react';
import { FlameChart, FlameChartNode, FlameChartPlugin, FlatTreeNode } from 'flame-chart-js';
import { FlameChartComponent, NodeTypes } from 'flame-chart-js/react';
import { parseSingleTrace, Span } from './jaeger/trace';
import { buildFlameChart, EnrichedFlameChartNode } from './jaeger/trace-flame-chart';
import SpanDetails from './components/span-details';
import './App.css';

function App() {
  const [flameChartData, setFlameChartData] = useState<FlameChartNode[] | undefined>();
  const [selectedSpan, setSelectedSpan] = useState<Span | undefined>();
  const [selectedAt, setSelectedAt] = useState<number | undefined>();
  const [zoom, setZoom] = useState<{start: number; end: number;} | undefined>();
  const [position, setPosition] = useState<{x: number; y: number;} | undefined>();

  var flameChartInstance: FlameChart | undefined = undefined;
  function setFlameChartInstance(instance: FlameChart) {
    flameChartInstance = instance;
  }

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
      setFlameChartData(flameChart);
    }
    reader.onerror = function (error) {
        throw error;
    }
  }

  function onSelect(data: NodeTypes) {
    if (data?.type === 'flame-chart-node') {
      const now = Date.now();
      const source = (data.node?.source as EnrichedFlameChartNode);
      const sourceSpan = source?.sourceSpan;
      if (sourceSpan !== selectedSpan) {
        setSelectedSpan(sourceSpan);
      } else if (data.node !== null && selectedAt !== undefined && now - selectedAt < 300) {
        zoomOnNode(data.node);
      }
      setSelectedAt(now);
    }
  }

  function zoomOnNode(node: FlatTreeNode) {
    var padding = node.source.duration * 0.05;
    var start = Math.max(0, node.source.start - padding);
    var end = node.source.start + node.source.duration + padding;
    setZoom({start: start, end: end});

    const nodeY = node.level * 17;
    setPosition({x: 0, y: Math.max(0, nodeY - 50)});
  }

  function selectNode(nodeToSelect: EnrichedFlameChartNode) {
    if (flameChartInstance === undefined)
      return;

    const flameChartPlugin = flameChartInstance.plugins.find(plugin => plugin.name === 'flameChartPlugin') as FlameChartPlugin | undefined;
    if (flameChartPlugin === undefined)
      return;

    const flatTreeNode = flameChartPlugin.flatTree.find(node => node.source === nodeToSelect);
    if (flatTreeNode === undefined)
      return;

    flameChartPlugin.selectedRegion = { data: flatTreeNode, type: 'node' };
    flameChartPlugin.renderEngine.render();

    zoomOnNode(flatTreeNode);

    onSelect({ node: flatTreeNode, type: 'flame-chart-node' });
  }

  return (
    <div className="App">
      { flameChartData === undefined &&
        <div className="fileSelect">
          <label htmlFor="select-file">
            <img alt="jaeger-icon" src="https://www.jaegertracing.io/img/jaeger-icon-reverse-color.svg" />
            Load a Jaeger trace
          </label>
          <input id="select-file" type="file" onChange={handleFileUpload} />
        </div>
      }
      { flameChartData !== undefined &&
        <div>
          <FlameChartComponent
            data={flameChartData}
            settings={settings}
            className="flameChart"
            onSelect={onSelect}
            zoom={zoom}
            position={position}
            instance={setFlameChartInstance}
          />
          <SpanDetails span={selectedSpan} />
        </div>
      }
    </div>
  );
}

export default App;
