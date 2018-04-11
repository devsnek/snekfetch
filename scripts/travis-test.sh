set -e

npm run setup
npm run lint
npm run test

if [ "$TRAVIS_BRANCH" != "master" -o -n "$TRAVIS_TAG" -o "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo -e "Not sending coverage for a non master branch push - covering without sending."
  exit 0
fi

node -e "const [a,b,c]=process.version.split('.');((+a.slice(1)*0x1000)+(+b*0x100)+(+c)>=38912)||process.exit(1)"
if [ $? == 0 ]; then
  echo -e "Generating Coverage for a master branch push - covering and sending."
  npm run coverage
fi
