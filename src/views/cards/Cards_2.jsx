import { useState } from "react";
import Header from "../../components/Header";
import cards from "../../services/cards";
import { isEmpty } from "lodash";

const Cards = () => {
  const [statusCount, setstatusCount] = useState(0);
  const [totalCardsAndToBePrinted, setTotalCardsAndToBePrinted] = useState({});
  const [selectedCard, setSelectedCard] = useState("toBePrinted");
  const [userDropdownOptions, setUserDropdownOptions] = useState([]);

  const getUsersList = async ({ status } = {}) => {
    let _status = status;
    if (!_status) {
      _status = urlDateType.get("tab");
    }
    const userList = await cardService.getUsersList({
      ...(_status === "toBePrinted" && { _status: "SUBMITTED" }),
    });
    console.log("userList", userList);

    setUserDropdownOptions(userList);
  };

  return (
    <div>
      <Header
        currentComponentName="Cards"
        statusCount={statusCount}
        toTalScoreDetails={{
          totalScore: totalCardsAndToBePrinted?.totalCards || 0,
          totalScoreToshow: totalCardsAndToBePrinted?.totalShowing || 0,
          text: "Total Cards",
          name: "totalCards",
        }}
        secondaryTotalDetails={{
          secondaryTotalScore: totalCardsAndToBePrinted.toBePrinted,
          secondaryTotalScoreToshow:
            totalCardsAndToBePrinted.totalPrintCardsShowing,
          text: "To Be Printed",
          name: "toBePrinted",
        }}
        showPrintMode={selectedCard === "toBePrinted"}
        {...(selectedCard === "totalCards" && {
          statusOption: isEmpty(statusCount)
            ? [
                { label: "SUBMITTED" },
                { label: "PRINTED" },
                { label: "UNDELIVERED" },
                { label: "DELIVERED" },
                { label: "DISCARDED" },
                { label: "RTO" },
              ]
            : Object.keys(statusCount).map((k) => ({
                label: `${k} (${statusCount[k]})`,
              })),
        })}
        defaultSelectedCard="toBePrinted"
        pSelectedCard={selectedCard}
        showSecondaryScoreCard
        createdByOptions={userDropdownOptions || []}
        createdByKeyMap={{ labelKey: "name", codeKey: "uid" }}
        // tehsilCounts={tehsilCounts}
        handleSelectCard={handleCardSelect}
        isNavAllowed={() => {
          return isEmpty(markAsPrintPending) || selectedCard !== "toBePrinted";
        }}
        isImageMode={isImageMode}
        handleViewChange={() => setIsImageMode(!isImageMode)}
        apiCallBack={getTableData}
      />
    </div>
  );
};

export default Cards;
