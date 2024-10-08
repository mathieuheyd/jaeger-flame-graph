import { FlameChartNode } from "flame-chart-js/.";

type EnrichedFlameChartNode = FlameChartNode & {
  isPushDownNode?: boolean;
}

function unclutter(flameChart: FlameChartNode) {
  // unclutter inbounds recursively first to give prioriry to siblings 
  unclutterInbounds(flameChart);
  unclutterOutOfBounds(flameChart);
}

function unclutterInbounds(node: FlameChartNode) {
  if (node.children === undefined || node.children.length === 0)
      return;

  // sort children
  node.children.sort(compareNodes);

  const depthTracker = new DepthTracker();

  for (let i = 0; i < node.children.length; ++i) {
    let child = node.children[i];
    const childEnd = child.start + child.duration;
    
    unclutterInbounds(child);

    if (!isInboundNode(child, node))
      continue;

    const maxDepthForInterval = depthTracker.getMaxDepthForInterval(child.start, childEnd);
    if (maxDepthForInterval > 0) {
      node.children[i] = pushDownNode(child, maxDepthForInterval);
      child = node.children[i];
    }

    const childMaxDepth = nodeInboundMaxDepth(child);
    depthTracker.addIntervalWithDepth(child.start, childEnd, childMaxDepth);
  }
}

function unclutterOutOfBounds(node: FlameChartNode) {
  const maxDepthInbounds = getAllMaxDepthsInbound(node);
  unclutterOutOfBoundsRecursively(node, maxDepthInbounds, 0);
}

function unclutterOutOfBoundsRecursively(node: FlameChartNode, maxDepths: DepthTracker, nodeDepth: number) {
  if (node.children === undefined || node.children.length === 0)
    return;

  for (let i = 0; i < node.children.length; ++i) {
    let child = node.children[i];

    let childDepth = nodeDepth + 1;
    if (!isInboundNode(child, node)) {
      const childEnd = child.start + child.duration;
      const currentMaxDepth = maxDepths.getMaxDepthForInterval(child.start, childEnd);
      if (nodeDepth <= currentMaxDepth) {
        const pushedDownDepth = currentMaxDepth - nodeDepth;
        const pushedDownNode = pushDownNode(child, pushedDownDepth);
        node.children[i] = pushedDownNode;
        childDepth += pushedDownDepth;
      }
      const nodeMaxDepth = nodeInboundMaxDepth(child);
      maxDepths.addIntervalWithDepth(child.start, childEnd, nodeMaxDepth + nodeDepth);
    }

    unclutterOutOfBoundsRecursively(child, maxDepths, childDepth);
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

function pushDownNode(node: FlameChartNode, depth: number): EnrichedFlameChartNode {
  if (depth <= 0)
    return node;

  const pushedDown = {
    name: "",
    start: node.start,
    duration: 0,
    children: [node],
    isPushDownNode: true
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

function nodeInboundMaxDepth(node: FlameChartNode): number {
  return nodeMaxDepthInternal(node, true);
}

function nodeMaxDepthInternal(node: FlameChartNode, onlyInbound: boolean): number {
  if (node.children === undefined || node.children.length === 0)
    return 1;

  let childrenMaxDepth = 0;
  node.children.forEach(child => {
    if (onlyInbound && !isInboundNode(child, node))
      return;
    const childMaxDepth = nodeMaxDepthInternal(child, onlyInbound);
    if (childMaxDepth > childrenMaxDepth)
        childrenMaxDepth = childMaxDepth;
  });

  return 1 + childrenMaxDepth;
}

function getAllMaxDepthsInbound(node: FlameChartNode): DepthTracker {
  const depthTracker = new DepthTracker();
  fillAllMaxDepthsInbound(node, 1, depthTracker);
  return depthTracker;
}

function fillAllMaxDepthsInbound(node: FlameChartNode, nodeDepth: number, depthTracker: DepthTracker) {
  depthTracker.addIntervalWithDepth(node.start, node.start + node.duration, nodeDepth);

  if (node.children === undefined || node.children.length === 0)
    return;

  node.children.forEach(child => {
    if (isInboundNode(child, node)) {
      fillAllMaxDepthsInbound(child, nodeDepth + 1, depthTracker);
    }
  });
}

function isInboundNode(node: EnrichedFlameChartNode, parent: FlameChartNode): boolean {
  // Exception for pushed down nodes
  if (node.isPushDownNode === true)
    return isInboundNode(node.children![0], parent);
  return (node.start + node.duration <= parent.start + parent.duration);
}

export { unclutter };
