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
  todayScore, // New prop for today's score
  yesterdayScore, // New prop for yesterday's score
}) => {
  return (
    <Card elevation={3} sx={{ borderRadius: "20px" }}>
      <CardActionArea onClick={handleCardClick}>
        <CardContent sx={{ height: height, pb: 0 }}>
          <Box textAlign="end">
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
          {/* Display today's and yesterday's scores if available */}
          {todayScore !== undefined && yesterdayScore !== undefined && (
            <Box
              display="flex"
              flexDirection="row"
              columnGap={1}
              justifyContent="space-between"
              sx={{ mt: 1 }}
            >
              <Box display="flex">
                <Typography variant="body1" color="textSecondary">
                  Today:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color="textSecondary"
                >
                  {todayScore}
                </Typography>
              </Box>
              <Box display="flex">
                <Typography variant="body1" color="textSecondary">
                  Yesterday:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color="textSecondary"
                >
                  {yesterdayScore}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
        {/* Colored Bottom covering 20% of the card area */}
        <Box
          sx={{
            ...(bgcolor?.includes("linear")
              ? { backgroundImage: bgcolor }
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
