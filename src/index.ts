#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ErrorCode,
	ListToolsRequestSchema,
	McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { RundeckCli } from "./rundeck-cli.js";
import type {
	ExecutionFollowParams,
	ExecutionInfoParams,
	ExecutionListParams,
	ExecutionOutputParams,
	JobForecastParams,
	JobInfoParams,
	JobListParams,
	JobRunParams,
	NodeListParams,
	ProjectInfoParams,
	ProjectListParams,
	SystemInfoParams,
} from "./types.js";

class RundeckMcpServer {
	private server: Server;
	private rundeckCli: RundeckCli;

	constructor() {
		this.server = new Server(
			{
				name: "rundeck-mcp-server",
				version: "1.0.0",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.rundeckCli = new RundeckCli();

		this.setupToolHandlers();

		// 錯誤處理
		this.server.onerror = (error) => console.error("[MCP Error]", error);
		process.on("SIGINT", async () => {
			await this.server.close();
			process.exit(0);
		});
	}

	private setupToolHandlers() {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				// 作業相關工具
				{
					name: "list_jobs",
					description: "列出項目中的所有作業",
					inputSchema: {
						type: "object",
						properties: {
							project: {
								type: "string",
								description: "項目名稱",
							},
							format: {
								type: "string",
								description: "輸出格式（可選，默認為 table）",
							},
						},
						required: ["project"],
					},
				},
				{
					name: "get_job_info",
					description: "獲取作業的詳細信息",
					inputSchema: {
						type: "object",
						properties: {
							id: {
								type: "string",
								description: "作業 ID",
							},
						},
						required: ["id"],
					},
				},
				{
					name: "run_job",
					description: "執行作業",
					inputSchema: {
						type: "object",
						properties: {
							id: {
								type: "string",
								description: "作業 ID",
							},
							options: {
								type: "object",
								description: "作業選項（可選，JSON 格式）",
							},
						},
						required: ["id"],
					},
				},

				// 執行相關工具
				{
					name: "list_executions",
					description: "列出項目中的執行",
					inputSchema: {
						type: "object",
						properties: {
							project: {
								type: "string",
								description: "項目名稱",
							},
							max: {
								type: "number",
								description: "最大結果數（可選，默認為 20）",
							},
						},
						required: ["project"],
					},
				},
				{
					name: "get_execution_info",
					description: "獲取執行的詳細信息",
					inputSchema: {
						type: "object",
						properties: {
							id: {
								type: "string",
								description: "執行 ID",
							},
						},
						required: ["id"],
					},
				},
				{
					name: "get_execution_output",
					description: "獲取執行的輸出",
					inputSchema: {
						type: "object",
						properties: {
							id: {
								type: "string",
								description: "執行 ID",
							},
							tail: {
								type: "number",
								description: "輸出行數（可選）",
							},
						},
						required: ["id"],
					},
				},

				// 項目相關工具
				{
					name: "list_projects",
					description: "列出所有項目",
					inputSchema: {
						type: "object",
						properties: {
							format: {
								type: "string",
								description: "輸出格式（可選，默認為 table）",
							},
						},
						required: [],
					},
				},
				{
					name: "get_project_info",
					description: "獲取項目的詳細信息",
					inputSchema: {
						type: "object",
						properties: {
							project: {
								type: "string",
								description: "項目名稱",
							},
						},
						required: ["project"],
					},
				},

				// 節點和系統相關工具
				{
					name: "list_nodes",
					description: "列出項目中的節點",
					inputSchema: {
						type: "object",
						properties: {
							project: {
								type: "string",
								description: "項目名稱",
							},
							filter: {
								type: "string",
								description: "節點過濾器（可選）",
							},
						},
						required: ["project"],
					},
				},
				{
					name: "get_system_info",
					description: "獲取 Rundeck 系統信息",
					inputSchema: {
						type: "object",
						properties: {},
						required: [],
					},
				},
			],
		}));

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			try {
				const args = request.params.arguments || {};

				switch (request.params.name) {
					// 作業相關工具
					case "list_jobs": {
						this.validateParams(args, ["project"]);
						const project = String(args.project);
						const format = args.format ? String(args.format) : undefined;
						const result = await this.rundeckCli.listJobs(project, format);
						return this.formatToolResponse(result);
					}

					case "get_job_info": {
						this.validateParams(args, ["id"]);
						const id = String(args.id);
						const result = await this.rundeckCli.getJobInfo(id);
						return this.formatToolResponse(result);
					}

					case "run_job": {
						this.validateParams(args, ["id"]);
						const id = String(args.id);
						const options = args.options as Record<string, string> | undefined;
						// const follow = args.follow === true;
						const result = await this.rundeckCli.runJob(id, options);
						return this.formatToolResponse(result);
					}

					// 執行相關工具
					case "list_executions": {
						this.validateParams(args, ["project"]);
						const project = String(args.project);
						const max = args.max ? Number(args.max) : undefined;
						const result = await this.rundeckCli.listExecutions(project, max);
						return this.formatToolResponse(result);
					}

					case "get_execution_info": {
						this.validateParams(args, ["id"]);
						const id = String(args.id);
						const result = await this.rundeckCli.getExecutionInfo(id);
						return this.formatToolResponse(result);
					}

					case "get_execution_output": {
						this.validateParams(args, ["id"]);
						const id = String(args.id);
						const tail = args.tail ? Number(args.tail) : undefined;
						const result = await this.rundeckCli.getExecutionOutput(id, tail);
						return this.formatToolResponse(result);
					}

					// 項目相關工具
					case "list_projects": {
						const format = args.format ? String(args.format) : undefined;
						const result = await this.rundeckCli.listProjects(format);
						return this.formatToolResponse(result);
					}

					case "get_project_info": {
						this.validateParams(args, ["project"]);
						const project = String(args.project);
						const result = await this.rundeckCli.getProjectInfo(project);
						return this.formatToolResponse(result);
					}

					// 節點和系統相關工具
					case "list_nodes": {
						this.validateParams(args, ["project"]);
						const project = String(args.project);
						const filter = args.filter ? String(args.filter) : undefined;
						const result = await this.rundeckCli.listNodes(project, filter);
						return this.formatToolResponse(result);
					}

					case "get_system_info": {
						const result = await this.rundeckCli.getSystemInfo();
						return this.formatToolResponse(result);
					}

					default:
						throw new McpError(
							ErrorCode.MethodNotFound,
							`未知工具: ${request.params.name}`,
						);
				}
			} catch (error) {
				console.error(`工具執行錯誤: ${error}`);
				return {
					content: [
						{
							type: "text",
							text: `執行錯誤: ${error}`,
						},
					],
					isError: true,
				};
			}
		});
	}

	private validateParams(
		args: Record<string, unknown>,
		requiredParams: string[],
	) {
		for (const param of requiredParams) {
			if (args[param] === undefined) {
				throw new McpError(ErrorCode.InvalidParams, `缺少必要參數: ${param}`);
			}
		}
	}

	private formatToolResponse(result: {
		success: boolean;
		output: string;
		error?: string;
	}) {
		return {
			content: [
				{
					type: "text",
					text: result.success ? result.output : result.error || "未知錯誤",
				},
			],
			isError: !result.success,
		};
	}

	async run() {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error("Rundeck MCP 服務器運行在 stdio 上");
	}
}

const server = new RundeckMcpServer();
server.run().catch(console.error);
