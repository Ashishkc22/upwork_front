import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ArogyaCard from "../../components/ArogyaCard_v2";

function CardPreviewDialog({
  cardData,
  open,
  setSelectedCardData,
  setIsDialogOpen,
}) {
  return (
    <Dialog
      onClose={() => {
        setIsDialogOpen(false);
        setSelectedCardData({});
      }}
      open={open}
    >
      <DialogContent sx={{ overflowX: "hidden", overflowY: "hidden" }}>
        <ArogyaCard cardData={cardData} />
      </DialogContent>
    </Dialog>
  );
}

export default CardPreviewDialog;
