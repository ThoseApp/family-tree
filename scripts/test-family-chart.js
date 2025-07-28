#!/usr/bin/env node

/**
 * Test script to verify family-chart library loading
 * Run with: node scripts/test-family-chart.js
 */

console.log("Testing family-chart library loading...");

async function testFamilyChart() {
  try {
    console.log("Attempting to import family-chart...");

    // Test dynamic import
    const familyChartModule = await import("family-chart");
    const f3 = familyChartModule.default || familyChartModule;

    console.log("✅ Family-chart imported successfully");
    console.log("Library object:", typeof f3);
    console.log("Available methods:", Object.keys(f3 || {}));

    // Test if key methods are available
    const requiredMethods = ["createSvg", "CalculateTree", "view"];
    const missingMethods = requiredMethods.filter(
      (method) => !f3 || typeof f3[method] !== "function"
    );

    if (missingMethods.length === 0) {
      console.log("✅ All required methods are available");
    } else {
      console.log("❌ Missing methods:", missingMethods);
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to load family-chart:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

// Run the test
testFamilyChart().then((success) => {
  process.exit(success ? 0 : 1);
});
