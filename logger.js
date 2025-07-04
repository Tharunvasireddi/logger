import chalk from "chalk";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
const { readdir, unlink } = fsPromises;

class CustomLogger {
  constructor(options = {}) {
    const {
      logDir = "logs",
      maxLogAgeDays = 7,
      logToFile = true,
      logToConsole = true,
    } = options;

    this.logDir = logDir;
    this.maxLogAgeDays = maxLogAgeDays;
    this.logToFile = logToFile;
    this.logToConsole = logToConsole;

    this.levels = {
      error: { color: chalk.red, priority: 0 },
      info: { color: chalk.green, priority: 1 },
      debug: { color: chalk.blue, priority: 2 },
      silly: { color: chalk.magenta, priority: 3 },
    };

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    if (this.logToFile) {
      this.cleanOldLogs().catch(console.error);
    }
  }

  async cleanOldLogs() {
    const files = await readdir(this.logDir);
    const now = Date.now();
    const maxAgeMs = this.maxLogAgeDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        await unlink(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    }
  }

  getLogFilePath() {
    const dateStr = new Date().toISOString().split("T")[0];
    return path.join(this.logDir, `${dateStr}.log`);
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const coloredLevel = this.levels[level].color(levelStr);
    return `[${timestamp}] ${coloredLevel} ${message}`;
  }

  writeToFile(level, message) {
    if (!this.logToFile) return;

    const logFile = this.getLogFilePath();
    const formatted = this.formatMessage(level, message).replace(
      /\x1b\[\d+m/g,
      ""
    );
    fs.appendFileSync(logFile, formatted + "\n");
  }

  log(level, message) {
    if (!this.levels[level]) {
      throw new Error(`Invalid log level: ${level}`);
    }
    const formatted = this.formatMessage(level, message);

    if (this.logToConsole) {
      console.log(formatted);
    }

    if (this.logToFile) {
      this.writeToFile(level, message);
    }
  }

  error(message) {
    this.log("error", message);
  }

  info(message) {
    this.log("info", message);
  }

  debug(message) {
    this.log("debug", message);
  }

  silly(message) {
    this.log("silly", message);
  }
}

const logger = new CustomLogger();
export default logger;
