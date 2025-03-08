import { createContext, useContext, useEffect, useState } from "react";
import cards from "../../../services/cards";
import { getUsersByUid } from "../../../services/users";
import { isEmpty, difference } from "lodash";
const CardContext = createContext();

export const CardContextProvider = ({ children }) => {
  const [toBePrintedCards, setToBePrintedCards] = useState([]);
  const [cardLocationTagData, setCardLocationTagData] = useState([]);
  const [FEDetails, setFEDetails] = useState({});
  const [TLDetails, setTLDetails] = useState({});
  const [currentActiveLocation, setCurrentActiveLocation] = useState({});
  const [paginationData, setPaginationData] = useState({});
  const [paginationCardCount, setPaginationCardCount] = useState({});
  const [sortData, setSortData] = useState({});
  const [filterData, setFilterData] = useState({
    isPrintMode: "",
    q: "",
    gram_p: "",
    state: "MP",
    district: "",
    duration: "",
    tehsil: "",
    created_by: "",
    till_duration: "",
  });
  const [allLocationUIDlist, setAllLocationUIDList] = useState({}); //For comparing ids in locationFEUidList
  const [totalCardsAndToBePrinted, setTotalCardsAndToBePrinted] = useState({
    totalCards: 0,
    toBePrinted: 0,
  });

  function findDuplicateValues(arr, key = []) {
    const valueCounts = new Map();
    const newArr = [];
    arr.forEach((obj, index) => {
      if (obj[key[0]] !== undefined && obj[key[1]] !== undefined) {
        if (valueCounts.has(`${obj[key[0]]} ${obj[key[1]]}`)) {
          newArr[index] = { ...obj, isDuplicate: true };
          const dupIndex = valueCounts.get(`${obj[key[0]]} ${obj[key[1]]}`);
          newArr[dupIndex] = { ...newArr[dupIndex], isDuplicate: true };
        } else {
          valueCounts.set(`${obj[key[0]]} ${obj[key[1]]}`, index);
          newArr[index] = { ...obj, isDuplicate: false };
        }
      }
    });
    return newArr;
  }

  const getCardsByLocation = async ({
    location,
    pagination = {},
    feList = [],
  }) => {
    if (!isEmpty(location)) {
      console.log("getCardsByLocation location", location);
      const response = await cards.getCardDataByLocation({
        _paginationData: { ...paginationData, ...pagination },
        location,
        filterData,
      });
      if (!isEmpty(feList)) {
        await getUsersByUID({ feList, location });
      }
      if (response?.status === "success") {
        const newData = {};
        Object.keys(response.data).forEach(
          (key) =>
            (newData[key] = findDuplicateValues(response.data[key], [
              "name",
              "father_husband_name",
            ]))
        );
        setToBePrintedCards((prev) => {
          const newObject = {
            ...prev,
            [`${location.district} ${location.tehsil}`]: newData,
          };
          return newObject;
        });
        setPaginationCardCount((p) => ({
          ...p,
          [`${location.district} ${location.tehsil}`]: response.paginationData,
        }));
      }
      return response.data;
    }
  };

  const setTablesPagination = (data) => {
    if (isEmpty(data)) return;
    const locationPagination = {};
    data.forEach((locationData) => {
      const { district, tehsil } = locationData?._id;
      locationPagination[`${district} ${tehsil}`] = {};
      locationData.createByUids.forEach((uid) => {
        locationPagination[`${district} ${tehsil}`][uid] = {
          limit: 100,
          page: 0,
        };
      });
    });
    setPaginationData(locationPagination);
  };

  const getCardsForSingleTableByLocation = async ({
    location,
    sortBy,
    pagination,
    feUid = {},
  }) => {
    if (!isEmpty(location)) {
      // const pagination =
      //   paginationData?.[`${location.district},${location.tehsil}`]?.[feUid] ||
      //   {};
      console.log("pagination", pagination);
      const response = await cards.getSingleFECardsByLocation({
        ...pagination,
        filterData,
        sortBy,
        location,
        feUid,
      });
      if (response?.status === "success") {
        setToBePrintedCards((prev) => {
          const newObject = {
            ...prev,
          };
          newObject[`${location.district} ${location.tehsil}`][feUid] =
            response.data;
          return newObject;
        });
        if (!isEmpty(pagination)) {
          setPaginationData((prev) => {
            const newObj = {
              ...prev,
              [`${location.district} ${location.tehsil}`]: {
                ...prev[`${location.district} ${location.tehsil}`],
                [feUid]: pagination,
              },
            };
            return newObj;
          });
        }
      }
      return response?.data;
    }
  };

  const getUsersByUID = async ({ feList = [] }) => {
    if (!isEmpty(feList) && difference(Object.keys(FEDetails || {}), feList)) {
      const response = await getUsersByUid({
        params: { agentUids: feList },
      });
      if (response?.status === "success") {
        setFEDetails((prev) => {
          return {
            ...prev,
            ...response.data.FEDetails,
          };
        });
        setTLDetails((prev) => {
          return {
            ...prev,
            ...response.data.tlDetails,
          };
        });
      }
    }
  };

  const getTobePrinntedCards = async () => {
    const data = await cards.getToBePrintedCards(filterData);
    setCardLocationTagData(data?.groupedData);
    console.log("data?.groupedData -----", data?.groupedData);
    setTotalCardsAndToBePrinted({
      totalCards: data.totalCards,
      toBePrinted: data.totalPrintedCards,
      totalPrintCardsShowing: data.totalPrintCardsShowing,
      totalShowing: data.totalShowing,
      pendingCardCount: data.pendingCardCount,
    });
    setTablesPagination(data?.groupedData);
    if (data && !isEmpty(data?.groupedData)) {
      setCurrentActiveLocation(data.groupedData[0]._id);
      console.log(" data.groupedData[0]", data.groupedData[0]);
      getCardsByLocation({
        location: data.groupedData[0]._id,
        feList: data.groupedData[0].createByUids,
      });
    }
    return data;
  };

  const updateFilters = ({ filterData }) => {
    setFilterData((prv) => {
      const newFilterData = {};
      if (prv.isPrintMode !== (filterData.isPrintMode || "")) {
        newFilterData.isPrintMode = filterData.isPrintMode;
      }
      if (prv.q !== (filterData.q || "")) {
        newFilterData.q = filterData.q;
      }
      if (prv.gram_p !== (filterData.gram_p || "")) {
        newFilterData.gram_p = filterData.gram_p;
      }
      if (prv.state !== (filterData.state || "MP")) {
        newFilterData.state = filterData.state;
      }
      if (prv.district !== (filterData.district || "")) {
        newFilterData.district = filterData.district;
      }
      if (prv.duration !== (filterData.duration || "")) {
        newFilterData.duration = filterData.duration;
      }
      if (prv.tehsil !== (filterData.tehsil || "")) {
        newFilterData.tehsil = filterData.tehsil;
      }
      if (prv.created_by !== (filterData.created_by || "")) {
        newFilterData.created_by = filterData.created_by;
      }
      if (prv.till_duration !== (filterData.till_duration || "")) {
        newFilterData.till_duration = filterData.till_duration;
      }
      console.log("UPDATED VALUES", newFilterData, filterData);
      if (!isEmpty(newFilterData)) {
        return {
          ...prv,
          ...newFilterData,
        };
      }
      return prv;
    });
  };

  const setALLLocationUIDS = () => {
    const newLocationFEUidList = {};
    Object.keys(toBePrintedCards).forEach((location) => {
      if (!newLocationFEUidList[location]) {
        newLocationFEUidList[location] = [];
      }
      Object.keys(toBePrintedCards[location]).forEach((feUid) => {
        if (!newLocationFEUidList[location].includes(`${location}/${feUid}`)) {
          newLocationFEUidList[location].push(`${location}/${feUid}`);
        }
      });
    });
    setAllLocationUIDList(newLocationFEUidList);
  };

  useEffect(() => {
    console.log("toBePrintedCards setALLLocationUIDS", toBePrintedCards);
    if (!isEmpty(toBePrintedCards)) {
      setALLLocationUIDS();
    }
  }, [toBePrintedCards]);

  useEffect(() => {
    console.log("------CONTEXT CALL API-----", filterData);

    getTobePrinntedCards();
  }, [filterData]);

  useEffect(() => {
    if (isEmpty(currentActiveLocation)) {
      getCardsByLocation({ location: currentActiveLocation });
    }
  }, [currentActiveLocation]);

  return (
    <CardContext.Provider
      value={{
        toBePrintedCards,
        currentActiveLocation,
        setCurrentActiveLocation,
        getCardsByLocation,
        getCardsForSingleTableByLocation,
        FEDetails,
        TLDetails,
        setTablesPagination,
        paginationCardCount,
        paginationData,
        getTobePrinntedCards,
        updateFilters,
        cardLocationTagData,
        allLocationUIDlist,
        setSortData,
        totalCardsAndToBePrinted,
        setTotalCardsAndToBePrinted,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => useContext(CardContext);
