import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import styles from "./treemap.css";

// Color palette for treemap nodes
const colors = [
  "#e0ac2b",
  "#6689c6",
  "#a4c969",
  "#e85252",
  "#9a6fb0",
  "#a53253",
  "#7f7f7f",
];

const TreeChart = ({ data }) => {
  const containerRef = useRef(null); // Ref to get container dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update chart dimensions when the container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener for window resize to update chart dimensions
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Create hierarchy and layout
  const hierarchy = useMemo(() => {
    // Convert the input data to the required format
    const convertedData = {
      name: "root",
      children: data,
    };
    return d3.hierarchy(convertedData).sum((d) => d.size); // Use size instead of value
  }, [data]);

  // List of level 1 items and related color scale
  const firstLevelGroups = hierarchy?.children?.map((child) => child.data.name);
  const colorScale = d3
    .scaleOrdinal()
    .domain(firstLevelGroups || [])
    .range(colors);

  // Generate the tree layout using the dynamic dimensions
  const root = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return null;
    const treeGenerator = d3
      .treemap()
      .size([dimensions.width, dimensions.height])
      .padding(4);
    return treeGenerator(hierarchy);
  }, [hierarchy, dimensions]);

  // Render nodes only if the root is available
  const allShapes = root?.leaves().map((leaf, i) => {
    const parentName = leaf.parent?.data.name;
    return (
      <g
        key={i}
        className={styles.rectangle}
        onClick={() => console.log("clicked", leaf.data)}
      >
        {/* Rectangle for each node */}
        {/* Node name */}

        <rect
          x={leaf.x0}
          y={leaf.y0}
          width={leaf.x1 - leaf.x0}
          height={leaf.y1 - leaf.y0}
          stroke="transparent"
          fill={colorScale(parentName)}
          className={"opacity-80 hover:opacity-100"}
        />
        {/* Node name */}
        <text
          x={leaf.x0 + 3}
          y={leaf.y0 + 3}
          fontSize={12}
          textAnchor="start"
          alignmentBaseline="hanging"
          fill="white"
          className="font-bold"
        >
          {leaf.data.name}
        </text>
        {/* Node value */}
        <text
          x={leaf.x0 + 3}
          y={leaf.y0 + 18}
          fontSize={12}
          textAnchor="start"
          alignmentBaseline="hanging"
          fill="white"
          className="font-light"
        >
          {leaf.data.size} {/* Use size instead of value */}
        </text>
      </g>
    );
  });

  return (
    <div
      ref={containerRef} // Set ref to the container div
      className={styles.container}
      style={{ width: "90vw", height: "calc(100vh - 25vh)" }} // Full width and height
    >
      <svg width={dimensions.width} height={dimensions.height}>
        {allShapes}
      </svg>
    </div>
  );
};

export default TreeChart;
