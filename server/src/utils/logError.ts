import config from "@/config/app.config.js";
import chalk from "chalk";

interface LogErrorArgs {
  errorType: string;
  statusCode: number;
  statusText: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string | null;
}

const logError = ({
  errorType,
  statusCode,
  statusText,
  message = "Unknown Error",
  details = {},
  stack = null,
}: LogErrorArgs) => {
  const formattedStack = stack ? stack.split("\n").slice(1).join("\n") : undefined;

  console.error(chalk.red(`❌ ${errorType}`));
  console.error(chalk.red(`----------------------------------------`));
  console.error(chalk.red(`- Error: (${statusCode}) ${statusText}`));
  console.error(chalk.red(`- Message: ${message}`));
  if (Object.keys(details).length > 0) {
    console.error(chalk.red(`- Details:`));
    for (const [key, value] of Object.entries(details)) {
      console.error(chalk.red(`  - ${key}: ${value}`));
    }
  }
  if (formattedStack && config.env === "development") {
    console.error(chalk.red(`----------------------------------------`));
    console.error(chalk.red(`Stack Trace:\n${formattedStack}`));
  }
};

export default logError;
