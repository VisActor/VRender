#!/usr/bin/env node
/**
 * VRender 测试覆盖率分析工具
 * 用于分析当前测试覆盖情况，找出缺失的测试
 */

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const results = {};

function analyzePackage(packageName) {
  const packagePath = path.join(packagesDir, packageName);
  const srcPath = path.join(packagePath, 'src');
  const testPath = path.join(packagePath, '__tests__/unit');

  if (!fs.existsSync(srcPath)) {
    return { error: 'No src directory' };
  }

  const srcFiles = getAllTsFiles(srcPath);
  const testFiles = fs.existsSync(testPath) ? getAllTestFiles(testPath) : [];

  // 分析每个模块的测试覆盖
  const coverage = {};
  srcFiles.forEach(file => {
    const relativePath = path.relative(srcPath, file);
    const moduleName = relativePath.replace('.ts', '').replace('.tsx', '');
    const testName = path.basename(moduleName);

    const hasTest = testFiles.some(testFile => {
      const testFileName = path.basename(testFile);
      return testFileName.includes(testName) ||
             testFileName.includes(moduleName.replace(/\//g, '_'));
    });

    coverage[moduleName] = {
      hasTest,
      testFile: hasTest ? testFiles.find(t =>
        path.basename(t).includes(testName)
      ) : null
    };
  });

  const testedCount = Object.values(coverage).filter(v => v.hasTest).length;
  const totalCount = Object.keys(coverage).length;

  return {
    srcFiles: srcFiles.length,
    testFiles: testFiles.length,
    coverage,
    coveragePercent: totalCount > 0 ? (testedCount / totalCount * 100).toFixed(2) : 0
  };
}

function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('__') && item !== 'node_modules') {
      files.push(...getAllTsFiles(fullPath));
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      if (!item.endsWith('.d.ts') && !item.includes('.test.')) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

function getAllTestFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllTestFiles(fullPath));
    } else if (stat.isFile() && (item.endsWith('.test.ts') || item.endsWith('.test.tsx'))) {
      files.push(fullPath);
    }
  });

  return files;
}

// 分析所有包
const packages = [
  'vrender-core',
  'vrender-kits',
  'vrender-components',
  'vrender-animate',
  'react-vrender',
  'react-vrender-utils'
];

console.log('🔍 VRender 测试覆盖率分析\n');
console.log('=' .repeat(80));

packages.forEach(pkg => {
  console.log(`\n📦 ${pkg}`);
  console.log('-'.repeat(80));

  const result = analyzePackage(pkg);

  if (result.error) {
    console.log(`  ❌ ${result.error}`);
    return;
  }

  results[pkg] = result;

  console.log(`  源码文件: ${result.srcFiles}`);
  console.log(`  测试文件: ${result.testFiles}`);
  console.log(`  覆盖率: ${result.coveragePercent}%`);

  // 找出缺失的测试
  const missingTests = Object.entries(result.coverage)
    .filter(([_, v]) => !v.hasTest)
    .map(([name]) => name)
    .slice(0, 10); // 只显示前10个

  if (missingTests.length > 0) {
    console.log(`  ⚠️  缺失测试的模块 (前10个):`);
    missingTests.forEach(name => {
      console.log(`     - ${name}`);
    });
    if (Object.keys(result.coverage).filter(([_, v]) => !v.hasTest).length > 10) {
      const remaining = Object.keys(result.coverage).filter(([_, v]) => !v.hasTest).length - 10;
      console.log(`     ... 还有 ${remaining} 个模块`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('📊 总结\n');

const totalSrc = Object.values(results).reduce((sum, r) => sum + (r.srcFiles || 0), 0);
const totalTest = Object.values(results).reduce((sum, r) => sum + (r.testFiles || 0), 0);
const totalCoverage = Object.values(results).reduce((sum, r) =>
  sum + parseFloat(r.coveragePercent || 0), 0) / Object.keys(results).length;

console.log(`总源码文件: ${totalSrc}`);
console.log(`总测试文件: ${totalTest}`);
console.log(`平均覆盖率: ${totalCoverage.toFixed(2)}%`);

// 输出详细报告到文件
const reportPath = path.join(__dirname, '../test-coverage-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 详细报告已保存到: ${reportPath}`);
