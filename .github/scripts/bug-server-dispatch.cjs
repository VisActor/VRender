async function resolveBugServerTarget({ github, context, prNumber, headSha }) {
  const defaultBranch = context.payload.repository.default_branch;
  if (context.ref !== `refs/heads/${defaultBranch}`) {
    throw new Error(`Run this workflow from the default branch (${defaultBranch}).`);
  }
  if (!/^[1-9][0-9]*$/.test(prNumber) || !Number.isSafeInteger(Number(prNumber))) {
    throw new Error('PR number must be a positive integer.');
  }
  if (headSha.length !== 40 || !/^[0-9a-f]+$/i.test(headSha)) {
    throw new Error('Head SHA must be a full 40-character hexadecimal commit SHA.');
  }

  const { data: pull } = await github.rest.pulls.get({
    ...context.repo,
    pull_number: Number(prNumber)
  });
  const repository = `${context.repo.owner}/${context.repo.repo}`;
  if (pull.base.repo.full_name !== repository) {
    throw new Error(`PR base repository must be ${repository}.`);
  }
  const sha = headSha.toLowerCase();
  if (pull.head.sha !== sha) {
    throw new Error(
      `PR #${prNumber} head changed: expected ${sha}, current ${pull.head.sha}. Review the current head before retrying.`
    );
  }

  return {
    prNumber: Number(prNumber),
    sha,
    headRef: pull.head.ref,
    prUrl: pull.html_url
  };
}

module.exports = { resolveBugServerTarget };
