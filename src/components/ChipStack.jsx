import ChipStack from "./ChipsStack";
import { Grid } from "@mui/material";

const CardStack = ({ value, setFilter, type, otherData }) => {
  if (!value) return;
  let label = value;
  if ((type === "CUSTOM" || type === "CUSTOM DATE") && !value) {
    return;
  } else if (type === "CUSTOM" || type === "CUSTOM DATE") {
    label = value;
  }
  return (
    <Grid item xs={12}>
      <ChipStack
        chipData={[
          { label, onDelete: () => setFilter({ value, type, otherData }) },
        ]}
      />
    </Grid>
  );
};

export default CardStack;
