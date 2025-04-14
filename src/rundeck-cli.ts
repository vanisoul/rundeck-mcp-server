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
	 * @param format 輸出格式
	 * @returns 執行結果
	 */
	async getJobInfo(id: string, format = "json"): Promise<ExecutionResult> {
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

		// 添加分隔符
		args.push("--");

		if (options) {
			for (const [key, value] of Object.entries(options)) {
				args.push(`-${key}`, value);
			}
		}

		return this.execute(args);
	}

	/**
	 * 獲取作業調度預測
	 * @param id 作業 ID
	 * @returns 執行結果
	 */
	async getJobForecast(id: string): Promise<ExecutionResult> {
		return this.execute(["jobs", "forecast", id]);
	}

	// 執行相關方法

	/**
	 * 列出項目中的執行
	 * @param project 項目名稱
	 * @param status 執行狀態
	 * @param max 最大結果數
	 * @returns 執行結果
	 */
	async listExecutions(
		project: string,
		status?: string,
		max = 20,
	): Promise<ExecutionResult> {
		const args = [
			"executions",
			"query",
			"--project",
			project,
			"--max",
			max.toString(),
		];

		if (status) {
			args.push("--status", status);
		}

		return this.execute(args);
	}

	/**
	 * 獲取執行信息
	 * @param id 執行 ID
	 * @returns 執行結果
	 */
	async getExecutionInfo(id: string): Promise<ExecutionResult> {
		return this.execute(["executions", "info", id]);
	}

	/**
	 * 獲取執行輸出
	 * @param id 執行 ID
	 * @param node 節點名稱
	 * @param step 步驟
	 * @returns 執行結果
	 */
	async getExecutionOutput(
		id: string,
		node?: string,
		step?: string,
	): Promise<ExecutionResult> {
		const args = ["executions", "output", id];

		if (node) {
			args.push("--node", node);
		}

		if (step) {
			args.push("--step", step);
		}

		return this.execute(args);
	}

	/**
	 * 跟踪執行輸出
	 * @param id 執行 ID
	 * @returns 執行結果
	 */
	async followExecution(id: string): Promise<ExecutionResult> {
		return this.execute(["executions", "follow", id]);
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
		return this.execute(["projects", "info", "--project", project]);
	}

	// 節點和系統相關方法

	/**
	 * 列出項目中的節點
	 * @param project 項目名稱
	 * @param filter 節點過濾器
	 * @returns 執行結果
	 */
	async listNodes(project: string, filter?: string): Promise<ExecutionResult> {
		const args = ["nodes", "list", "--project", project];

		if (filter) {
			args.push("--filter", filter);
		}

		return this.execute(args);
	}

	/**
	 * 獲取系統信息
	 * @param stats 是否包含統計信息
	 * @returns 執行結果
	 */
	async getSystemInfo(stats = true): Promise<ExecutionResult> {
		const args = ["system", "info"];

		// 移除 --stats 選項，因為 Rundeck CLI 不支持

		return this.execute(args);
	}
}
