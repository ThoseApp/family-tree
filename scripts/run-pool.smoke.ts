import { runPool } from "../lib/utils/run-pool";

async function main() {
  // 1. Order preserved, all fulfilled, values mapped
  const res = await runPool(
    [10, 20, 30, 40, 50],
    async (n) => {
      await new Promise((r) => setTimeout(r, n));
      return n * 2;
    },
    { concurrency: 2, retries: 0 }
  );
  console.assert(res.length === 5, "expected length 5");
  console.assert(
    res.every((r) => r.status === "fulfilled"),
    "expected all fulfilled"
  );
  console.assert(res[2].value === 60, "expected res[2].value === 60");

  // 2. Retries once, then succeeds
  let attempts = 0;
  const res2 = await runPool(
    ["x"],
    async () => {
      attempts++;
      if (attempts < 2) throw new Error("boom");
      return "ok";
    },
    { concurrency: 1, retries: 1 }
  );
  console.assert(attempts === 2, "expected exactly 2 attempts");
  console.assert(res2[0].status === "fulfilled", "expected eventual success");

  // 3. Exhausts retries -> rejected; sibling unaffected
  const res3 = await runPool(
    ["a", "b"],
    async (s) => {
      if (s === "a") throw new Error("fail-a");
      return s;
    },
    { concurrency: 2, retries: 1 }
  );
  console.assert(res3[0].status === "rejected", "expected 'a' rejected");
  console.assert(res3[1].status === "fulfilled", "expected 'b' fulfilled");

  console.log("runPool smoke: OK");
}

main();
