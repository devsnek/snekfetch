set -e

if [ "$TRAVIS_BRANCH" != "master" -o -n "$TRAVIS_TAG" -o "$TRAVIS_PULL_REQUEST" != "false" ]; then
  echo -e "Not sending coverage for a non master branch push - covering without sending."
  npm run coverage
  exit 0
fi

echo -e "Generating Coverage for a master branch push - covering and sending."

npm run coverage

npm run coveralls
