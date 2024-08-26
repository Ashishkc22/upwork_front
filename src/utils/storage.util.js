function getStorageData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
function setStorageData(data, key) {
  localStorage.setItem(key, JSON.stringify(data));
}
function removeItem(key) {
  localStorage.removeItem(key);
}
function eraseStroageData() {
  localStorage.clear();
}

export default {
  getStorageData,
  setStorageData,
  eraseStroageData,
  removeItem,
};
