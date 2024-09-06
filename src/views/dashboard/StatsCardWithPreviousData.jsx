import { Box, Card, CardContent, Typography } from "@mui/material";

const DataCard = ({
  title,
  todayScore,
  todayPercentage,
  yesterdayScore = "",
  yesterdayPercentage = "",
}) => {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: "20px",
        // width: 250,
        // minWidth: 170,
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {title}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="textSecondary">
              Today's Score
            </Typography>
            <Typography variant="h4" color="primary">
              {todayScore}
            </Typography>
            <Typography
              variant="body2"
              color={todayPercentage >= 0 ? "green" : "red"}
            >
              {todayPercentage}%
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              Yesterday's Score
            </Typography>
            <Typography variant="h4" color="primary">
              {yesterdayScore || "5.23"}
            </Typography>
            <Typography
              variant="body2"
              color={yesterdayPercentage >= 0 ? "green" : "red"}
            >
              {yesterdayPercentage || 53}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard;
