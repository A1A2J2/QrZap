(async () => {
  const jspdfModule = await import('jspdf');
  console.log("Keys:", Object.keys(jspdfModule));
  console.log("Default:", !!jspdfModule.default);
  console.log("jsPDF:", !!jspdfModule.jsPDF);
})();
