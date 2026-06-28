import fs from "fs";

const logPath = "C:\\Users\\chris\\.gemini\\antigravity\\brain\\0361de44-671b-4879-a696-a7e07bf620f0\\.system_generated\\logs\\transcript.jsonl";

function listEdits() {
  const content = fs.readFileSync(logPath, "utf-8");
  const lines = content.split("\n");

  console.log("Analyzing file modifications in logs...");
  for (const line of lines) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === "write_to_file" || tc.name === "replace_file_content" || tc.name === "multi_replace_file_content") {
            const args = typeof tc.args === "string" ? JSON.parse(tc.args) : tc.args;
            const target = args.TargetFile || args.targetFile;
            console.log(`Step ${obj.step_index}: ${tc.name} -> ${target}`);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

listEdits();
