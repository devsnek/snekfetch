module.exports = {
  browser: typeof window !== 'undefined',
  webpack: false, // !!process.env.__SNEKFETCH_WEBPACK__
};
