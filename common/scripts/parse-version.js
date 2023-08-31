// see more about the regex here: https://semver.org/lang/zh-CN/
// reg test: https://regex101.com/r/vkijKf/1/
const SEMVER_REG = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;

function parseVersion(version) {
  const res = SEMVER_REG.exec(version);

  if (res) {
    return {
      major: +res[1],
      minor: +res[2],
      patch: +res[3],
      preReleaseName: res[4],
      preReleaseType: res[4] && res[4].includes('.') ? res[4].split('.')[0] : res[4]
    };
  }

  return null;
}	

module.exports = parseVersion