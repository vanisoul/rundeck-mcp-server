// 定義 Rundeck CLI 工具的輸入和輸出類型

// 作業相關類型
export interface JobListParams {
	project: string;
	format?: string;
}

export interface JobInfoParams {
	id: string;
	format?: string;
}

export interface JobRunParams {
	id: string;
	options?: Record<string, string>;
	follow?: boolean;
}

export interface JobForecastParams {
	id: string;
}

// 執行相關類型
export interface ExecutionListParams {
	project: string;
	status?: "running" | "succeeded" | "failed" | "aborted";
	max?: number;
}

export interface ExecutionInfoParams {
	id: string;
}

export interface ExecutionOutputParams {
	id: string;
	node?: string;
	step?: string;
}

export interface ExecutionFollowParams {
	id: string;
}

// 項目相關類型
export interface ProjectListParams {
	format?: string;
}

export interface ProjectInfoParams {
	project: string;
}

// 節點和系統相關類型
export interface NodeListParams {
	project: string;
	filter?: string;
}

export interface SystemInfoParams {
	stats?: boolean;
}

// 執行結果類型
export interface ExecutionResult {
	success: boolean;
	output: string;
	error?: string;
}
