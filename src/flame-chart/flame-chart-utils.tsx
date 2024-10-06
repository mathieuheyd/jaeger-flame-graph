import { FlameChartNode } from "flame-chart-js/.";

function unclutter(flameChart: FlameChartNode) {
  unclutterRecursively(flameChart);
}

function unclutterRecursively(node: FlameChartNode) {
  if (node.children === undefined || node.children.length === 0)
      return;

  // sort children
  node.children.sort(compareNodes);

  const depthTracker = new DepthTracker();

  for (let i = 0; i < node.children.length; ++i) {
    let child = node.children[i];
    const childEnd = child.start + child.duration;
    
    unclutterRecursively(child);

    const maxDepthForInterval = depthTracker.getMaxDepthForInterval(child.start, childEnd);
    if (maxDepthForInterval > 0) {
      // we need to unclutter here
      //child.color = '#AA0000';
      node.children[i] = pushDownNode(child, maxDepthForInterval);
      child = node.children[i];
    }

    const childMaxDepth = nodeMaxDepth(child);
    depthTracker.addIntervalWithDepth(child.start, childEnd, childMaxDepth);
  }
}

type Depth = {
  start: number;
  end: number;
  depth: number;
};

class DepthTracker {
  depths: Depth[] = [];

  addIntervalWithDepth(start: number, end: number, depth: number) {
    this.depths.push({ start: start, end: end, depth: depth });
  }

  getMaxDepthForInterval(start: number, end: number): number {
    var maxDepthForInterval = 0;
    this.depths.forEach(depth => {
      if (depth.start >= end || start >= depth.end)
        return;
      if (depth.depth > maxDepthForInterval)
        maxDepthForInterval = depth.depth;
    });
    return maxDepthForInterval;
  }
}

function pushDownNode(node: FlameChartNode, depth: number): FlameChartNode {
  if (depth <= 0)
    return node;

  const pushedDown = {
    name: "",
    start: node.start,
    duration: 0,
    children: [node]
  };

  return pushDownNode(pushedDown, depth - 1);
}

function compareNodes(nodeA: FlameChartNode, nodeB: FlameChartNode) {
  const startDiff = nodeA.start - nodeB.start;
  if (startDiff !== 0)
    return startDiff;
  else
    return nodeB.duration - nodeA.duration;
}

function nodeMaxDepth(node: FlameChartNode): number {
  if (node.children === undefined || node.children.length === 0)
    return 1;

  let childrenMaxDepth = 0;
  node.children.forEach(child => {
    const childMaxDepth = nodeMaxDepth(child);
    if (childMaxDepth > childrenMaxDepth)
        childrenMaxDepth = childMaxDepth;
  });

  return 1 + childrenMaxDepth;
}

export { unclutter };
