const activeEnv = "test"; // dev, test, pro, staging

const apiInfo = {
  dev: {
    protocol: "http",
    url: "localhost",
    port: 6060,
  },
  test: {
    protocol: "https",
    url: "new-repo-upwork.onrender.com",
  },
  pro: {
    protocol: "https",
    url: "asia-south1-arogyam-super.cloudfunctions.net/app",
  },
  staging: {
    protocol: "https",
    url: "asia-south1-health-demo-dev.cloudfunctions.net/app",
  },
};

function getSystemDomain() {
  return document.location.host;
}

function isLocalEnvironment() {
  const ipAddress = window.location.hostname;

  // Regex pattern for local IP address ranges
  const localIPRegex = /^(127\.0\.0\.1|::1|localhost|192\.168\.|10\.|172\.)/;
  if (activeEnv) {
    return activeEnv;
  } else if (!localIPRegex.test(ipAddress)) {
    return "test";
  } else {
    return "pro";
  }
  // return false;
}

function isTestEnvironment() {
  const ipAddress = window.location.hostname;
  return ipAddress.includes(".netlify.app");
}

function protocol() {
  if (isTestEnvironment()) {
    return apiInfo.test.protocol;
  }
  return apiInfo[isLocalEnvironment()]?.protocol || apiInfo.pro.protocol;
}

function getPort() {
  return apiInfo[isLocalEnvironment()]?.port || apiInfo.pro.port;
}

function getDomain() {
  return apiInfo[isLocalEnvironment()]?.url || apiInfo.pro.url;
}

function getApiUrl({ path = false }) {
  let url = `${protocol()}://${getDomain()}:${getPort()}`;
  if (isLocalEnvironment() !== "pro" || isLocalEnvironment() !== "staging") {
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
