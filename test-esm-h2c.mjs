(async () => {
  const h2c = await import('html2canvas');
  console.log("Keys:", Object.keys(h2c));
  console.log("Default:", !!h2c.default);
})();
