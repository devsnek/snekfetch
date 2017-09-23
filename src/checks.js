module.exports = {
  browser: typeof window !== 'undefined',
  webpack: !!process.env.__SNEKFETCH_WEBPACK__,
};
