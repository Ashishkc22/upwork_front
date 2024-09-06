import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActionArea,
} from "@mui/material";

const DashboardCard = ({
  title,
  total,
  percentageChange,
  height,
  bgcolor,
  handleCardClick,
}) => {
  return (
    <Card elevation={3} sx={{ borderRadius: "20px" }}>
      <CardActionArea onClick={handleCardClick}>
        <CardContent
          //   sx={{ height: "70%" }}
          sx={{ height: height }}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Typography variant="h2" color="primary">
              {total}
            </Typography>
            <Typography
              variant="body1"
              color={percentageChange > 0 ? "green" : "red"}
            >
              {percentageChange}%
            </Typography>
          </Box>
        </CardContent>
        {/* Colored Bottom covering 20% of the card area */}
        <Box
          sx={{
            ...(bgcolor?.includes("linear")
              ? {
                  backgroundImage: bgcolor,
                }
              : { backgroundColor: bgcolor }),
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            padding: "5%",
          }}
        >
          <Typography variant="h4" fontWeight="600" color="textSecondary">
            {title}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default DashboardCard;
