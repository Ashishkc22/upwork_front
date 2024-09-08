const apiInfo = {
  dev: {
    protocol: "http",
    url: "localhost",
    port: 6060,
  },
  pro: {
    protocol: "https",
    url: "5e4d-103-249-89-222.ngrok-free.app",
  },
};

function getSystemDomain() {
  return document.location.host;
}

function isLocalEnvironment() {
  const ipAddress = window.location.hostname;

  // Regex pattern for local IP address ranges
  const localIPRegex = /^(127\.0\.0\.1|::1|localhost|192\.168\.|10\.|172\.)/;

  return localIPRegex.test(ipAddress);
  // return false;
}

function protocol() {
  return isLocalEnvironment() ? apiInfo.dev.protocol : apiInfo.pro.protocol;
}

function getPort() {
  return isLocalEnvironment() ? apiInfo.dev.port : apiInfo.pro.port;
}

function getDomain() {
  return isLocalEnvironment() ? apiInfo.dev.url : apiInfo.pro.url;
}

function getApiUrl({ path = false }) {
  let url = `${protocol()}://${getDomain()}:${getPort()}`;
  if (!isLocalEnvironment()) {
    url = `${protocol()}://${getDomain()}`;
  }
  if (path) {
    url += `/${path}`;
  }
  return url;
}

export default {
  getPort,
  getApiUrl,
  isLocalEnvironment,
  protocol,
  getSystemDomain,
};
