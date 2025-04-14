import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { ExecutionResult } from "./types.js";

const execAsync = promisify(exec);

export class RundeckCli {
	private cliPath: string;
	private baseUrl: string | undefined;
	private apiToken: string | undefined;

	constructor() {
		this.cliPath =
			process.env.RUNDECK_CLI_PATH || "./rd-cli-tool-shadow-2.0.8/bin/rd";
		this.baseUrl = process.env.RUNDECK_BASE_URL;
		this.apiToken = process.env.RUNDECK_API_TOKEN;
	}

	/**
	 * 執行 Rundeck CLI 命令
	 * @param args 命令參數
	 * @returns 執行結果
	 */
	async execute(args: string[]): Promise<ExecutionResult> {
		try {
			// 構建基本命令
			let command = this.cliPath;

			// 添加命令參數
			command += ` ${args.join(" ")}`;

			// 使用環境變量而不是命令行參數
			const env = {
				...process.env,
				RD_URL: this.baseUrl,
				RD_TOKEN: this.apiToken,
			};

			console.error(`Executing: ${command}`);
			const { stdout, stderr } = await execAsync(command, { env });

			if (stderr && !stdout) {
				return {
					success: false,
					output: "",
					error: stderr,
				};
			}

			return {
				success: true,
				output: stdout,
			};
		} catch (error: unknown) {
			const err = error as {
				stdout?: string;
				stderr?: string;
				message?: string;
			};
			return {
				success: false,
				output: err.stdout || "",
				error: err.stderr || err.message || String(error),
			};
		}
	}

	// 作業相關方法

	/**
	 * 列出項目中的作業
	 * @param project 項目名稱
	 * @param format 輸出格式
	 * @returns 執行結果
	 */
	async listJobs(project: string, format = "table"): Promise<ExecutionResult> {
		const args = ["jobs", "list", "--project", project];

		if (format && format !== "table") {
			args.push("-f", format);
		}

		return this.execute(args);
	}

	/**
	 * 獲取作業信息
	 * @param id 作業 ID
	 * @returns 執行結果
	 */
	async getJobInfo(id: string): Promise<ExecutionResult> {
		const args = ["jobs", "info", "-i", id];

		return this.execute(args);
	}

	/**
	 * 執行作業
	 * @param id 作業 ID
	 * @param options 作業選項
	 * @param follow 是否跟踪輸出
	 * @returns 執行結果
	 */
	async runJob(
		id: string,
		options?: Record<string, string>,
		follow = false,
	): Promise<ExecutionResult> {
		const args = ["run", "-i", id];

		if (follow) {
			args.push("-f");
		}

		// 添加分隔符
		args.push("--");

		if (options) {
			for (const [key, value] of Object.entries(options)) {
				args.push(`-${key}`, value);
			}
		}

		return this.execute(args);
	}

	// 執行相關方法

	/**
	 * 列出項目中的執行
	 * @param project 項目名稱
	 * @param max 最大結果數
	 * @returns 執行結果
	 */
	async listExecutions(project: string, max = 20): Promise<ExecutionResult> {
		const args = ["executions", "list", "-p", project];

		if (max) {
			args.push("-m", max.toString());
		}

		return this.execute(args);
	}

	/**
	 * 獲取執行信息
	 * @param id 執行 ID
	 * @returns 執行結果
	 */
	async getExecutionInfo(id: string): Promise<ExecutionResult> {
		return this.execute(["executions", "info", "-e", id]);
	}

	/**
	 * 獲取執行輸出
	 * @param id 執行 ID
	 * @param tail 輸出行數
	 * @returns 執行結果
	 */
	async getExecutionOutput(id: string, tail = 10): Promise<ExecutionResult> {
		return this.execute(["executions", "follow", "-e", id, `-T=${tail}`]);
	}

	// 項目相關方法

	/**
	 * 列出所有項目
	 * @param format 輸出格式
	 * @returns 執行結果
	 */
	async listProjects(format = "table"): Promise<ExecutionResult> {
		const args = ["projects", "list"];

		if (format && format !== "table") {
			args.push("-f", format);
		}

		return this.execute(args);
	}

	/**
	 * 獲取項目信息
	 * @param project 項目名稱
	 * @returns 執行結果
	 */
	async getProjectInfo(project: string): Promise<ExecutionResult> {
		return this.execute(["projects", "info", "-p", project]);
	}

	// 節點和系統相關方法

	/**
	 * 列出項目中的節點
	 * @param project 項目名稱
	 * @param filter 節點過濾器
	 * @returns 執行結果
	 */
	async listNodes(project: string, filter?: string): Promise<ExecutionResult> {
		const args = ["nodes", "list", `-p=${project}`];

		if (filter) {
			args.push("-F", filter);
		}

		return this.execute(args);
	}

	/**
	 * 獲取系統信息
	 * @param stats 是否包含統計信息
	 * @returns 執行結果
	 */
	async getSystemInfo(): Promise<ExecutionResult> {
		const args = ["system", "info"];

		return this.execute(args);
	}
}
