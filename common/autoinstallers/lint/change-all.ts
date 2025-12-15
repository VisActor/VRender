import path from 'path';
import chalk from 'chalk';
import minimist, { ParsedArgs } from 'minimist';
import { spawnSync, execSync } from 'child_process';

interface RunScriptArgv extends ParsedArgs {
  message?: string;
  type?: string;
  'not-commit'?: boolean;
}

/**
 * 执行批量生成 Rush Change Files 并校验提交信息与版本类型
 */
function run() {
  const commitLineConfigPath = path.resolve(__dirname, './commitlint.config.js');
  const commitLintBinPath = path.resolve(__dirname, './node_modules/.bin/commitlint');
  const argv: RunScriptArgv = minimist(process.argv.slice(2));
  let message = argv.message;
  let bumpType = argv.type;
  let notCommit = argv['not-commit'];

  if (!message) {
    const lastCommitMessage = execSync('git log -1 --pretty=%B ').toString();

    if (!lastCommitMessage) {
      process.exit(1);
    }

    console.log(
      chalk.green(
        `[Notice] no message is supplied, we'll use latest commit mesage: ${chalk.red.bold(lastCommitMessage)}`
      )
    );
    message = lastCommitMessage;
  } else {
    const result = spawnSync('sh', ['-c', `echo ${message} | ${commitLintBinPath} --config ${commitLineConfigPath}`], {
      stdio: 'inherit'
    });

    if (result.status !== 0) {
      process.exit(1);
    }
  }

  if (!bumpType) {
    console.log(
      chalk.green(`[Notice] no bumpType is supplied, we'll use default bumpType: ${chalk.red.bold('patch')}`)
    );
    bumpType = 'patch';
  }

  const changeResult = spawnSync('sh', ['-c', `rush change --bulk --bump-type '${bumpType}' --message '${message}'`], {
    stdio: 'inherit',
    shell: false
  });

  if (changeResult.status !== 0) {
    console.error(
      chalk.red(
        '[Error] rush change 执行失败，可能由于浅克隆导致无法找到 merge base。请在 CI 使用 actions/checkout with fetch-depth: 0，并确保已 fetch origin/main。'
      )
    );
    process.exit(changeResult.status ?? 1);
  }

  if (!notCommit) {
    spawnSync('sh', ['-c', 'git add --all'], {
      stdio: 'inherit',
      shell: false
    });

    spawnSync('sh', ['-c', `git commit -m 'docs: update changlog of rush'`], {
      stdio: 'inherit',
      shell: false
    });
  }
}

run();
