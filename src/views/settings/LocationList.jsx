import React, { useEffect, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const RemovableList = ({
  initialItems = [],
  title = "",
  innerKey,
  clickDataKey = "",
  handleItemClick = () => {},
  selectedValue,
}) => {
  // State to manage the list of items
  const [items, setItems] = useState([]);

  // Handler to remove an item by index
  const removeItem = (index, event) => {
    event.stopPropagation(); // Prevent onClick event of parent <li> from firing
    setItems((prevItems) =>
      prevItems.filter((_, itemIndex) => itemIndex !== index)
    );
  };
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  return (
    <div
      style={{
        padding: "10px",
        maxWidth: "300px",
        margin: "20px auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        height: "71.6vh",
        overflowY: "scroll",
      }}
    >
      <h3>{title}</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {items.map((item, index) => (
          <li
            key={item[innerKey] + index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              textAlign: "center",
              width: "100%",
            }}
            onClick={() =>
              handleItemClick(item[clickDataKey], title, item[innerKey])
            }
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 10,
                px: 2,
                background: selectedValue === item[innerKey] && "#ffa6a6",
              }}
            >
              <span>{item[innerKey]}</span>
            </Box>
            {/* <Box>
              <IconButton
                onClick={(event) => removeItem(index, event)}
                sx={{ color: "red" }}
                // style={{
                //   background: "red",
                //   color: "white",
                //   border: "none",
                //   borderRadius: "4px",
                //   cursor: "pointer",
                // }}
              >
                <DeleteIcon />
              </IconButton>
            </Box> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RemovableList;
