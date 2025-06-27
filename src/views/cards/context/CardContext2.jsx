import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import cards from "../../../services/cards";
import { getUsersByUid } from "../../../services/users";
import { isEmpty } from "lodash";
import storageUtil from "../../../utils/storage.util";
const CardContext = createContext();

export const CardContextProvider2 = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cardLocationTagData, setCardLocationTagData] = useState([]);
  const [cardsScoreDetails, setCardsScroreDetails] = useState({
    totalCards: 0,
    toBePrinted: 0,
    totalPrintCardsShowing: 0,
    totalShowing: 0,
    pendingCardCount: 0,
  });
  const [openSections, setOpenSections] = useState({});
  const [cardDataByLocations, setCardDataByLocations] = useState({});
  const [agentDetailsByLocation, setAgentDetailsBylocation] = useState({});
  const [tableCountBylocation, setTableCountBylocation] = useState({});
  const [paginationDetailsBylLocation, setPaginationByLocation] = useState({});
  const [checkedSections, setCheckedSections] = useState({});
  const [sortTypeDataByLocation, setSortTypeDataByLocaton] = useState({});
  const [cardsDownloadCount, setCardDownloadCount] = useState(0);
  const [cardsTableSelectedForDownload, setCardsTableSelectedForDownload] =
    useState(new Set());
  const [markAsPrintedDetails, setMarkAsPrintedDetails] = useState(new Set());
  const [filterValues, setFilterValues] = useState({});
  const [isSectionsLoading, setsectionLoading] = useState({});
  const [mode, setMode] = useState("table");
  const [printModeDateTime, setPrintModeDateTime] = useState(() =>
    searchParams.get("printMode")
  );
  const [isPageLoading, setIsPageLoading] = useState(false);

  const getUsersByUID = async ({ feList = [], sectionName = "" }) => {
    if (!agentDetailsByLocation[sectionName]) {
      const response = await getUsersByUid({
        params: { agentUids: feList },
      });
      if (response?.status === "success") {
        setAgentDetailsBylocation((prev) => {
          return {
            ...prev,
            [sectionName]: {
              FEDetails: response.data.FEDetails,
              TLDetails: response.data.tlDetails,
            },
          };
        });
      }
    }
  };

  useEffect(
    () => console.log("FilterValue Changed to: ", filterValues),
    [filterValues]
  );

  function findDuplicateValues(arr, key = []) {
    const valueCounts = new Map();
    const ids = new Set();
    const newArr = [];
    arr.forEach((obj, index) => {
      ids.add(obj._id);
      if (obj[key[0]] !== undefined && obj[key[1]] !== undefined) {
        if (valueCounts.has(`${obj[key[0]]} ${obj[key[1]]}`)) {
          newArr[index] = { ...obj, isDuplicate: true };
          const dupIndex = valueCounts.get(`${obj[key[0]]} ${obj[key[1]]}`);
          newArr[dupIndex] = { ...newArr[dupIndex], isDuplicate: true };
        } else {
          if (
            obj?.name?.replace(/\s+/g, "") ===
            obj?.father_husband_name?.replace(/\s+/g, "")
          ) {
            newArr[index] = { ...obj, isDuplicate: true };
          } else {
            newArr[index] = { ...obj, isDuplicate: false };
          }
          valueCounts.set(`${obj[key[0]]} ${obj[key[1]]}`, index);
        }
      }
    });
    return { newArr, ids };
  }

  // GET Cards By location
  const getCardsByLocation = async ({
    location,
    pagination = {},
    feList = [],
    search = null,
    duration = null,
    till_duration = null,
    isPrintMode = null,
  }) => {
    let _filterValues = filterValues;
    setFilterValues((p) => {
      _filterValues = p;
      return p;
    });
    if (!isEmpty(location)) {
      const sectionName = `${location.district}-${location.tehsil}`;
      setsectionLoading((p) => ({ ...p, [sectionName]: true }));
      const paginationData = paginationDetailsBylLocation[sectionName];
      const response = await cards.getCardDataByLocation({
        _paginationData: { ...paginationData, ...pagination },
        location,
        q: search || _filterValues?.search || null,
        duration: duration || _filterValues?.duration || null,
        till_duration: till_duration || _filterValues?.till_duration || null,
        isPrintMode: isPrintMode || printModeDateTime || null,

        // filterData,
      });
      if (!isEmpty(feList)) {
        await getUsersByUID({
          feList,
          sectionName,
        });
      }

      if (response?.status === "success") {
        const newData = {};
        let cardIds = new Set(storageUtil.getStorageData("cards_ids") || []);
        console.log("cardIds", cardIds);
        Object.keys(response.data).forEach((key) => {
          const res = findDuplicateValues(response.data[key], [
            "name",
            "father_husband_name",
          ]);
          newData[key] = res.newArr;
          cardIds = new Set([...cardIds, ...res.ids]);
        });
        storageUtil.setStorageData([...cardIds], "cards_ids");
        setTableCountBylocation((prev) => ({
          ...prev,
          [sectionName]: response.paginationData,
        }));
        setCardDataByLocations((p) => ({
          ...p,
          [sectionName]: newData,
        }));
      }
      //   const newData = {};
      //   Object.keys(response.data).forEach(
      //     (key) =>
      //       (newData[key] = findDuplicateValues(response.data[key], [
      //         "name",
      //         "father_husband_name",
      //       ]))
      //   );
      //   setToBePrintedCards((prev) => {
      //     const newObject = {
      //       ...prev,
      //       [`${location.district} ${location.tehsil}`]: newData,
      //     };
      //     return newObject;
      //   });
      //   setPaginationCardCount((p) => ({
      //     ...p,
      //     [`${location.district} ${location.tehsil}`]: response.paginationData,
      //   }));
      // }
      setsectionLoading((p) => {
        p[sectionName] = false;
        return { ...p };
      });
      return response;
    }
  };

  // GET card data for single table by location
  const getCardsForSingleTableByLocation = async ({
    location,
    sortBy = null,
    pagination,
    feUid = "",
    duration = null,
    till_duration = null,
    isPrintMode = null,
  }) => {
    if (!isEmpty(location)) {
      const sectionName = `${location.district}-${location.tehsil}`;
      // const pagination =
      //   paginationData?.[`${location.district},${location.tehsil}`]?.[feUid] ||
      //   {};
      if (!pagination) {
        pagination = paginationDetailsBylLocation?.[sectionName]?.[feUid] || {
          page: 0,
          limit: 100,
        };
      }
      let _filterValues = filterValues;
      setFilterValues((p) => {
        _filterValues = p;
        return p;
      });
      const response = await cards.getSingleFECardsByLocation({
        ...pagination,
        sortBy,
        location,
        feUid,
        duration: duration || _filterValues?.duration || null,
        till_duration: till_duration || _filterValues?.till_duration || null,
        isPrintMode: isPrintMode || printModeDateTime || null,
      });
      if (response?.status === "success") {
        handleSortDataByLocation({
          section: sectionName,
          agentId: feUid,
          sortValue: sortBy,
        });

        const res = findDuplicateValues(response.data, [
          "name",
          "father_husband_name",
        ]);
        setCardDataByLocations((p) => ({
          ...p,
          [sectionName]: {
            ...(p[sectionName] || {}),
            [feUid]: res.newArr,
          },
        }));
        if (!isEmpty(pagination)) {
          // setPaginationData((prev) => {
          //   const newObj = {
          //     ...prev,
          //     [`${location.district} ${location.tehsil}`]: {
          //       ...prev[`${location.district} ${location.tehsil}`],
          //       [feUid]: pagination,
          //     },
          //   };
          //   return newObj;
          // });
        }
      }
      return response?.data;
    }
  };

  // GET  Cards Locations
  const getCardsLocationTags = async ({
    status,
    search,
    district,
    duration,
    created_by,
    selectedCard,
    tehsil,
    gram,
    till_duration,
    isPrintMode,
    callAPI = false,
  } = {}) => {
    let _filterValues = filterValues;
    // console.log(
    //   "get card location Tag with filterValues props:",
    //   status,
    //   search,
    //   district,
    //   duration,
    //   created_by,
    //   selectedCard,
    //   tehsil,
    //   gram,
    //   till_duration,
    //   isPrintMode
    // );
    console.log("filterValue", filterValues);
    setFilterValues((p) => {
      _filterValues = p;
      return p;
    });
    console.log("_filterValues", _filterValues);

    const data = await cards.getToBePrintedCards({
      _status: status || _filterValues?.status || null,
      q: search || _filterValues?.search || null,
      district: district || _filterValues?.district || null,
      created_by: created_by || _filterValues?.created_by || null,
      selectedCard: selectedCard || _filterValues?.selectedCard || null,
      tehsil: tehsil || _filterValues?.tehsil || null,
      gram_p: gram || _filterValues?.gram || null,
      duration: duration || _filterValues?.duration || null,
      till_duration: till_duration || _filterValues?.till_duration || null,
      isPrintMode: isPrintMode || printModeDateTime || null,
    });

    if (
      callAPI ||
      (!isEmpty(data?.groupedData) && (duration || till_duration || search))
    ) {
      const activeSections = [];

      Object.keys(openSections).forEach((k) => {
        if (openSections[k]) {
          const [district, tehsil] = k.split("-");
          activeSections.push({
            district,
            tehsil,
            sectionName: k,
          });
        }
      });

      // const
      // Initiate section loading for all active sections
      activeSections.forEach((sectionDetails) => {
        getCardsByLocation({
          location: sectionDetails,
          feList:
            agentDetailsByLocation?.[sectionDetails.sectionName]?.FEDetails ||
            [],
          duration,
          till_duration,
        });
      });
    }

    setCardLocationTagData(data?.groupedData || []);
    if (isEmpty(cardDataByLocations) && isEmpty(openSections)) {
      const firstSection = data?.groupedData[0];
      const sectionActiveDetails = data?.groupedData?.reduce(
        (a, sectionDetails) => ({
          ...a,
          [`${sectionDetails._id.district}-${sectionDetails._id.tehsil}`]: false,
        }),
        {}
      );
      setsectionLoading(() => sectionActiveDetails);
      toggleSection(firstSection._id, firstSection.createByUids);
    }

    setCardsScroreDetails((p) => ({
      ...p,
      ...(data?.totalCards && { totalCards: data.totalCards }),
      ...(data?.totalPrintedCards && { toBePrinted: data.totalPrintedCards }),
      ...(data?.totalPrintCardsShowing && {
        totalPrintCardsShowing: data.totalPrintCardsShowing,
      }),
      ...(data?.totalShowing && { totalShowing: data.totalShowing }),
      ...(data?.pendingCardCount && {
        pendingCardCount: data.pendingCardCount,
      }),
    }));
    setCheckedSections((p) => ({
      ...p,
      ...data?.groupedData?.reduce(
        (init, data) => ({
          ...init,
          [`${data._id.district}-${data._id.tehsil}`]: [],
        }),
        {}
      ),
    }));
    // setTablesPagination(data?.groupedData);

    // setCurrentActiveLocation(data.groupedData[0]._id);
    // getCardsByLocation({
    //   location: data.groupedData[0]._id,
    //   feList: data.groupedData[0].createByUids,
    // });
    setIsPageLoading(false);

    return data;
  };

  // setPaginationByLocation
  const setPaginationValues = ({
    sectionName = "",
    setDefaultValues = false,
    feList = [],
    agentId = "",
    values = { page: 0, limit: 100 },
  }) => {
    let defaultPaginationValues = {};
    if (setDefaultValues) {
      feList.forEach(
        (id) =>
          (defaultPaginationValues[id] = {
            page: 0,
            limit: 100,
          })
      );
    }
    setPaginationByLocation((p) => ({
      ...p,
      [sectionName]: {
        ...(p?.[sectionName] || {}),
        ...(agentId && { [agentId]: values }),
        ...defaultPaginationValues,
      },
    }));
  };

  // Handle sort data for card by location tables
  const handleSortDataByLocation = ({ section, agentId, sortValue = null }) => {
    setSortTypeDataByLocaton((p) => ({
      ...p,
      [section]: {
        ...p?.[section],
        [agentId]: sortValue,
      },
    }));
  };

  // Handle pagination change
  const handlePaginationChangesByLocation = ({
    section,
    agentId = "",
    sortBy = null,
    page = null,
    limit = null,
  }) => {
    const location = `${section.district}-${section.tehsil}`;
    getCardsForSingleTableByLocation({
      location: section,
      ...(page !== null && { pagination: { page, limit } }),
      feUid: agentId,
      sortBy,
    }).then(() => {
      if (page !== null) {
        setPaginationValues({
          sectionName: location,
          agentId,
          values: { page, limit },
        });
      }
    });
  };

  // section will be combination of district and tehsil
  // e.g. "District Tehsil"
  const toggleSection = (section, agentIds) => {
    if (!isEmpty(section)) {
      const sectionName = `${section.district}-${section.tehsil}`;
      setOpenSections((prev) => ({
        ...prev,
        [sectionName]: prev.hasOwnProperty(sectionName)
          ? !prev[sectionName]
          : true,
      }));
      if (!cardDataByLocations[sectionName]) {
        getCardsByLocation({ feList: agentIds, location: section });
        setPaginationValues({
          feList: agentIds,
          sectionName,
          setDefaultValues: true,
        });
      }
    }
  };

  const handleSectionCheck = ({
    section = "",
    agentId = "",
    agentIds = null,
  }) => {
    setCheckedSections((p) => {
      if (!agentIds) {
        if (!p?.[section]?.includes(agentId)) {
          p?.[section]?.push(agentId);
        } else {
          p[section] = p?.[section]?.filterValues((id) => id !== agentId) || [];
        }
      } else {
        p[section] = agentIds;
      }
      return { ...p };
    });
  };

  const handleCardsTableTobeDownloaded = ({
    sectionName,
    agentId,
    agentIds,
    isEntireRegionChecked,
  }) => {
    setCardsTableSelectedForDownload((p) => {
      let cardsTableToBeDownloaded = new Set(p);
      if (
        agentId &&
        cardsTableToBeDownloaded.has(`${sectionName}/${agentId}`)
      ) {
        cardsTableToBeDownloaded.delete(`${sectionName}/${agentId}`);
      } else if (agentId) {
        cardsTableToBeDownloaded.add(`${sectionName}/${agentId}`);
      } else {
        agentIds.forEach((id) => {
          const name = `${sectionName}/${id}`;
          if (isEntireRegionChecked) {
            cardsTableToBeDownloaded.delete(name);
          } else if (!cardsTableToBeDownloaded.has(name)) {
            cardsTableToBeDownloaded.add(name);
          }
        });
      }
      return cardsTableToBeDownloaded;
    });
  };

  const handleCardsCount = (
    count,
    sectionName,
    agentId,
    agentIds,
    isEntireRegionChecked
  ) => {
    setCardDownloadCount((p) => p + count);
    handleCardsTableTobeDownloaded({
      sectionName,
      agentId,
      agentIds,
      isEntireRegionChecked,
    });
  };

  const setMarkAsPrintedValues = (keys, toRemove = false) => {
    setMarkAsPrintedDetails((p) => {
      keys.forEach((k) => (toRemove ? p.delete(k) : p.add(k)));
      return new Set(p);
    });
  };

  const afterMarkAsPrintedAPIIsCalled = ({
    sectionName,
    agentIds,
    locationData,
  }) => {
    // remove Data from markAsPrinted useState
    setMarkAsPrintedValues(
      [...agentIds.map((id) => `${sectionName}/${id}`)],
      true
    );

    // Remove data from cardTagsState too
    setCardLocationTagData((p) => {
      const sectionIndex = p.findIndex(
        (t) =>
          t._id.district === locationData.district &&
          t._id.tehsil === locationData.tehsil
      );
      const sectionData = p[sectionIndex];
      const newFes = sectionData.createByUids.filterValues(
        (k) => !agentIds.includes(k)
      );
      if (!newFes.length) {
        p.splice(sectionIndex, 1);
      } else {
        p[sectionIndex].createByUids = newFes;
      }
      return [...p];
    });
    // Remove Table data that has been marked as printed
    setCardDataByLocations((p) => {
      const newData = { ...p };
      Object.keys(newData[sectionName]).forEach(
        (k) => agentIds.includes(k) && delete newData[sectionName][k]
      );
      return newData;
    });
  };

  const handleFilterChanges = ({ filter = null } = {}) => {
    setFilterValues((p) => ({ ...p, ...filter }));
  };

  return (
    <CardContext.Provider
      value={{
        getCardsLocationTags,
        cardLocationTagData,
        cardsScoreDetails,
        setCardsScroreDetails,
        openSections,
        toggleSection,
        agentDetailsByLocation,
        tableCountBylocation,
        cardDataByLocations,
        paginationDetailsBylLocation,
        setPaginationValues,
        handlePaginationChangesByLocation,
        checkedSections,
        setCheckedSections,
        handleSectionCheck,
        getCardsForSingleTableByLocation,
        sortTypeDataByLocation,
        cardsDownloadCount,
        handleCardsCount,
        cardsTableSelectedForDownload,
        setMarkAsPrintedValues,
        markAsPrintedDetails,
        afterMarkAsPrintedAPIIsCalled,
        filterValues,
        setFilterValues,
        isSectionsLoading,
        setsectionLoading,
        handleFilterChanges,
        mode,
        setMode,
        printModeDateTime,
        setPrintModeDateTime,
        isPageLoading,
        setIsPageLoading,
        getCardsByLocation,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext2 = () => useContext(CardContext);
