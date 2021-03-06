export default {
  include: [
    'index.js',
    'types.js',
    'static/*.bundle-*.js',
    'static/*.bundle-*.css',
    'static/index.html',
    'static/manifest.webmanifest',
    'static/service-worker.bundle.js',
    'static/worker.bundle.js',
    'LICENSE',
    'package.json',
    'yarn.lock',
    'README.md'
  ],
  exclude: [
  ],
  askVersion: true,
  releaseRepository: 'https://github.com/plantain-00/copy-tool-release.git',
  postScript: [
    // 'cd "[dir]" && rm -rf .git',
    // 'cp Dockerfile "[dir]"',
    // 'cd "[dir]" && docker build -t plantain/copy-tool . && docker push plantain/copy-tool'
    'git add package.json',
    'git commit -m "[version]"',
    'git tag v[version]',
    'git push',
    'git push origin v[version]',
  ]
}
