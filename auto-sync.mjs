/**
 * auto-sync.mjs
 * يسحب التحديثات من GitHub كل 30 ثانية تلقائياً
 * شغّله بجانب dev server: node auto-sync.mjs
 */

import { execSync } from "child_process";

const INTERVAL_SECONDS = 30;

function gitPull() {
  try {
    const output = execSync("git pull origin main", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const changed = !output.includes("Already up to date.");

    if (changed) {
      const timestamp = new Date().toLocaleTimeString("ar-EG");
      console.log(`\n✅ [${timestamp}] تحديث جديد من GitHub!`);
      console.log(output.trim());
    } else {
      process.stdout.write(".");
    }
  } catch (err) {
    console.error("\n⚠️  خطأ في git pull:", err.message);
  }
}

console.log(`🔄 Auto-sync شغّال — يتحقق كل ${INTERVAL_SECONDS} ثانية...`);
console.log("اضغط Ctrl+C لإيقافه\n");

// سحب فوري عند البدء
gitPull();

// ثم كل 30 ثانية
setInterval(gitPull, INTERVAL_SECONDS * 1000);
