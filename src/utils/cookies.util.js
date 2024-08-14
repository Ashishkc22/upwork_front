import envUtil from "./env.util";

function setCookie({ name = envUtil.getApiUrl({}), value, days }) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  value = typeof value === "string" ? value : JSON.stringify(value);
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie({ name = envUtil.getApiUrl({}) }) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  console.log("ca", ca);
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}
function eraseCookie() {
  let name = envUtil.getApiUrl({});
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
function clearAllCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}
export default {
  setCookie,
  getCookie,
  eraseCookie,
  clearAllCookies,
};
