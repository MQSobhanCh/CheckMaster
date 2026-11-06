import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export function buildBackup({ profile, cheques, installments }) {
  return {
    app: "CheckMaster",
    version: 1,
    createdAt: new Date().toISOString(),
    profile,
    cheques,
    installments,
  };
}

// Android: writes the file to the cache folder and opens the share sheet
// (save to Files, send to Telegram Saved Messages, ...).
// Web: normal file download.
export async function exportBackup(data) {
  const json = JSON.stringify(data, null, 2);
  const fileName = `checkmaster-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: "پشتیبان CheckMaster",
      text: "فایل پشتیبان CheckMaster",
      url: uri,
      dialogTitle: "ذخیره یا ارسال فایل پشتیبان",
    });

    return;
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

// Accepts backups made by this version and by older ones (which had no
// "app"/"version" fields) — only the two lists are required.
export function parseBackup(text) {
  const data = JSON.parse(text);

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.cheques) ||
    !Array.isArray(data.installments)
  ) {
    throw new Error("INVALID_BACKUP");
  }

  return data;
}
