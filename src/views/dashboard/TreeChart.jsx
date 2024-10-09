import React, { useState, useEffect, useMemo, useRef } from "react";
import { Grid } from "@mui/material";
import * as d3 from "d3";
import "./treemap.css";

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
    const parentName = leaf.parent?.data.name; // Get the parent group name
    return (
      <g
        key={i}
        className="rectangle"
        onClick={() => console.log("clicked", leaf.data)}
      >
        {/* Rectangle for each node */}
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

  // // Render group names above their respective rectangles
  // const groupNames = root?.children.map((group, i) => {
  //   const { x0, y0, x1, y1 } = group;

  //   return (
  //     <text
  //       key={i}
  //       x={(x0 + x1) / 2} // Center the group name horizontally
  //       y={y0 + 15} // Position the group name a bit below the top
  //       fontSize={14}
  //       textAnchor="middle"
  //       fill="black"
  //       className="font-bold"
  //     >
  //       {group.data.name}
  //     </text>
  //   );
  // });

  return (
    <div
      ref={containerRef} // Set ref to the container div
      className="container"
      style={{ width: "90vw", height: "calc(100vh - 25vh)" }} // Full width and height
    >
      <svg width={dimensions.width} height={dimensions.height}>
        {/* {groupNames} */}
        {allShapes}
      </svg>
    </div>
  );
};

export default TreeChart;
