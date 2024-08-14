import ChipStack from "../../components/ChipsStack";
import { Grid } from "@mui/material";

const CardStack = ({ filter, setFilter, date }) => {
  if (!filter) return;
  let label = filter;
  if ((filter === "CUSTOM" || filter === "CUSTOM DATE") && !date) {
    return;
  } else if (filter === "CUSTOM" || filter === "CUSTOM DATE") {
    label = date;
  }
  return (
    <Grid item xs={12}>
      <ChipStack chipData={[{ label, onDelete: () => setFilter("") }]} />
    </Grid>
  );
};

export default CardStack;
