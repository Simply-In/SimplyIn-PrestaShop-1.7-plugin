/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
const shell = require("shelljs");
const semver = require("semver");
const fs = require("fs");
const path = require("path");
/**
 * Checks if the input string is a valid GitHub SHA.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string is a valid GitHub SHA, false otherwise.
 */
function hasGithubSha(str) {
  return /^\s*[0-9a-f]{40}\s*$/i.test(str);
}

const allPosibleSemverHints = [
  "@patch",
  "@PATCH",
  "@minor",
  "@MINOR",
  "@major",
  "@MAJOR",
];
//functions:
/**
 * @typedef {Object} CommitInfo
 * @typedef {('major'|'minor'|'patch'|undefined)} Semver
 * @property {string} sha - The SHA of the commit.
 * @property {string} title - The description of the commit.
 * @property {string} description - The description of the commit.
 * @property {Semver} semverType - The semantic versioning type of the commit.
 */

/**
 * Unwraps commit information and determines the semantic versioning type.
 *
 * @param {string} commitInfo - The commit information as a string.
 * @returns {CommitInfo} An object containing the SHA, description, description, and semverType of the commit.
 */
const unwrapCommitShape = (commitInfo) => {
  const commitsParts = commitInfo.split("\n");
  const shaPartIndex = commitsParts.findIndex(hasGithubSha);
  let sha = commitsParts[shaPartIndex];
  let title = commitsParts[shaPartIndex + 1] ?? "";
  let descriptionPossiblyContainingSemverHint =
    commitsParts[shaPartIndex + 2] ?? "";
  let description = descriptionPossiblyContainingSemverHint;

  let decidingSemverHint = "@patch";
  allPosibleSemverHints.forEach((hint) => {
    if (description.includes(hint)) {
      decidingSemverHint = hint;
    }
    if (description.includes(hint)) {
      description = description.replace(hint, "").trim();
      decidingSemverHint = hint;
    }
  });
  let semverType;
  if (decidingSemverHint.toLowerCase() === "@major") {
    semverType = "major";
  } else if (decidingSemverHint.toLowerCase() === "@minor") {
    semverType = "minor";
  } else if (decidingSemverHint.toLowerCase() === "@patch") {
    semverType = "patch";
  }
  return { sha, title, description, semverType };
};
/**
 * Determines the cumulative semantic versioning type from an array of commit information.
 *
 * @param {CommitInfo[]} commitsInfos - An array of commit information objects.
 * @returns {Semver} The cumulative semantic versioning type. If any commit is of type 'major', returns 'major'. If no 'major' but there is 'minor', returns 'minor'. Otherwise, returns 'patch'.
 */
const getCumulatedSemverType = (commitsInfos) => {
  if (commitsInfos.length === 0) return "patch";
  const semverTypes = commitsInfos.map((c) => c.semverType);
  if (semverTypes.includes("major")) {
    return "major";
  }
  if (semverTypes.includes("minor")) {
    return "minor";
  }
  return "patch";
};
//end of functions

const args = process.argv.slice(2);
const parentBranchArg = args.find((arg) => arg.startsWith("--parent-branch="));
const parentBranch = parentBranchArg ? parentBranchArg.split("=")[1] : "dev";

const newestTag = shell
  .exec("git describe --tags `git rev-list --tags --max-count=1`", {
    silent: true,
  })
  .stdout.trim();

const newestTagCommitHash = shell
  .exec(`git rev-list -n 1 ${newestTag}`, { silent: true })
  .stdout.trim();
const currentBranchName = shell
  .exec("git rev-parse --abbrev-ref HEAD", { silent: true })
  .stdout.trim();

const commitsNewerThanLastTagAsCombinedString = shell.exec(
  `git log ${newestTagCommitHash}..${parentBranch} --pretty=format:"%H\n%B"`,
  { silent: true }
).stdout;

const commitsNewerThanLastTagAsArrayOfStrings =
  commitsNewerThanLastTagAsCombinedString.split("\n\n");
console.log({
  commitsNewerThanLastTagAsArrayOfStrings,
  commitsNewerThanLastTagAsCombinedString,
  parentBranch,
  newestTagCommit: newestTagCommitHash,
});

const shapedCommits = commitsNewerThanLastTagAsArrayOfStrings.map((c) =>
  unwrapCommitShape(c)
);
const semverVersionToIncrement = getCumulatedSemverType(shapedCommits);
console.log({
  commitsShapes: shapedCommits,
  semverVersionToUpdate: semverVersionToIncrement,
});
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = require(packageJsonPath);
const currentVersion = packageJson.version;
const newVersion = semver.inc(currentVersion, semverVersionToIncrement);

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

const changelogPath = path.join(__dirname, "..", "changelog.md");
let changelog = "";
if (fs.existsSync(changelogPath)) {
  const changelogFileContent = fs.readFileSync(changelogPath, "utf-8");
  console.log("changelog exists", { changelogFileContent });
  changelog = changelogFileContent;
} else {
  const filesInsideOfFolderThatWeThinkChangelogIsIn = fs.readdirSync(
    path.join(__dirname, "..")
  );
  console.log("changelog does not exist, lets create it", {
    filesInsideOfFolderThatWeThinkChangelogIsIn,
  });
  fs.writeFileSync(changelogPath, "");
}
const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format
const commitMessages = [
  ...shapedCommits.filter((commit) => commit.semverType === "major"),
  ...shapedCommits.filter((commit) => commit.semverType === "minor"),
  ...shapedCommits.filter((commit) => commit.semverType === "patch"),
]
  .map((commitInfo) => commitInfo.description)
  .filter(Boolean); // Filter out empty messages

const commitMessagesFormatted = commitMessages
  .map((msg) => `- ${msg}`)
  .join("\n");
const changelogAppendix =
  currentDate + ` (version: ${newVersion})` + ":\n" + commitMessagesFormatted;
changelog = changelogAppendix + "\n\n" + changelog;
if (commitMessages.length > 0) {
  fs.writeFileSync(changelogPath, changelog);
}
const commitMessage = `chore: bump version from ${currentVersion} to ${newVersion}`;
console.log({ changelog });
console.log({ commitMessage });

// Set Git user
shell.exec('git config --local user.email "automations@simply.in"');
shell.exec('git config --local user.name "Automations"');

// Commit the change
if (commitMessages.length > 0) {
  shell.exec(`git add changelog.md`);
}
shell.exec(`git add package.json`);
shell.exec(`git commit -m "${commitMessage} [skip ci]" --no-verify`);

// Create a new tag to just created commit
shell.exec(`git tag ${newVersion}`);

// // Push the changes
shell.exec(`git push origin ${currentBranchName} --tags --no-verify`);
