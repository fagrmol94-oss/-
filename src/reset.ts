import { execSync } from "child_process";

try {
  execSync("git checkout -- src/components/VoiceRoomSection.tsx");
  console.log("Successfully reverted VoiceRoomSection.tsx");
} catch (e: any) {
  console.error("Failed to revert:", e.message || e);
}
