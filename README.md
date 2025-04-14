# Rundeck MCP 服務器

這是一個 Model Context Protocol (MCP) 服務器，用於與 Rundeck CLI 進行交互。它提供了一組工具，使您可以 AI 完成 Rundeck 操作，而無需直接與命令行交互。

## 功能

- **作業（Jobs）管理**：列出、獲取信息、執行和預測
- **執行（Executions）管理**：列出、獲取信息、獲取輸出和跟踪
- **項目（Projects）管理**：列出和獲取信息
- **節點（Nodes）和系統（System）信息**：列出節點和獲取系統信息

## 安裝

### 前提條件

- Node.js (v14 或更高版本)
- Rundeck CLI 工具

### 步驟

1. 克隆此存儲庫：

```bash
git clone https://github.com/yourusername/rundeck-mcp-server.git
cd rundeck-mcp-server
```

2. 安裝依賴：

```bash
npm install
```

3. 構建項目：

```bash
npm run build
```

4. 配置 MCP 設置文件：

將以下配置添加到 MCP 設置文件中。設置文件的位置取決於您的環境：

```json
{
  "mcpServers": {
    "rundeck": {
      "command": "node",
      "args": ["/path/to/rundeck-mcp-server/build/index.js"],
      "env": {
        "RUNDECK_CLI_PATH": "/path/to/rundeck-cli/bin/rd",
        "RUNDECK_BASE_URL": "http://your-rundeck-server:port/",
        "RUNDECK_API_TOKEN": "your-api-token"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

請確保替換以下值：

- `/path/to/rundeck-mcp-server/build/index.js`：指向構建後的 index.js 文件的絕對路徑
- `/path/to/rundeck-cli/bin/rd`：指向 Rundeck CLI 工具的絕對路徑
- `http://your-rundeck-server:port/`：您的 Rundeck 服務器 URL
- `your-api-token`：您的 Rundeck API 令牌

5. 重新啟動 VS Code 或 Claude Desktop 以使設置生效。

## How install Rundeck CLI

- https://docs.rundeck.com/docs/rd-cli/install.html

## 使用方法

一旦配置完成，您可以使用以下方式調用 MCP 工具：

```
<use_mcp_tool>
<server_name>rundeck</server_name>
<tool_name>list_projects</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
```

### 可用工具

#### 作業（Jobs）相關工具

- **list_jobs**：列出項目中的所有作業

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>list_jobs</tool_name>
  <arguments>
  {
    "project": "MyProject"
  }
  </arguments>
  </use_mcp_tool>
  ```

- **get_job_info**：獲取作業的詳細信息

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>get_job_info</tool_name>
  <arguments>
  {
    "id": "job-id-here"
  }
  </arguments>
  </use_mcp_tool>
  ```

- **run_job**：執行作業

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>run_job</tool_name>
  <arguments>
  {
    "id": "job-id-here",
    "options": {
      "param1": "value1",
      "param2": "value2"
    },
    "follow": true
  }
  </arguments>
  </use_mcp_tool>
  ```

- **get_job_forecast**：獲取作業的調度預測
  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>get_job_forecast</tool_name>
  <arguments>
  {
    "id": "job-id-here"
  }
  </arguments>
  </use_mcp_tool>
  ```

#### 執行（Executions）相關工具

- **list_executions**：列出項目中的執行

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>list_executions</tool_name>
  <arguments>
  {
    "project": "MyProject",
    "status": "running",
    "max": 20
  }
  </arguments>
  </use_mcp_tool>
  ```

- **get_execution_info**：獲取執行的詳細信息

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>get_execution_info</tool_name>
  <arguments>
  {
    "id": "execution-id-here"
  }
  </arguments>
  </use_mcp_tool>
  ```

- **get_execution_output**：獲取執行的輸出

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>get_execution_output</tool_name>
  <arguments>
  {
    "id": "execution-id-here",
    "node": "node-name",
    "step": "step-number"
  }
  </arguments>
  </use_mcp_tool>
  ```

- **follow_execution**：實時跟踪執行的輸出
  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>follow_execution</tool_name>
  <arguments>
  {
    "id": "execution-id-here"
  }
  </arguments>
  </use_mcp_tool>
  ```

#### 項目（Projects）相關工具

- **list_projects**：列出所有項目

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>list_projects</tool_name>
  <arguments>
  {}
  </arguments>
  </use_mcp_tool>
  ```

- **get_project_info**：獲取項目的詳細信息
  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>get_project_info</tool_name>
  <arguments>
  {
    "project": "MyProject"
  }
  </arguments>
  </use_mcp_tool>
  ```

#### 節點（Nodes）和系統（System）相關工具

- **list_nodes**：列出項目中的節點

  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>list_nodes</tool_name>
  <arguments>
  {
    "project": "MyProject",
    "filter": "tags:production"
  }
  </arguments>
  </use_mcp_tool>
  ```

- **get_system_info**：獲取系統信息
  ```
  <use_mcp_tool>
  <server_name>rundeck</server_name>
  <tool_name>get_system_info</tool_name>
  <arguments>
  {}
  </arguments>
  </use_mcp_tool>
  ```

## 測試

您可以使用提供的測試腳本來測試 MCP 服務器的功能：

```bash
node test.js
```

這個測試腳本將啟動 MCP 服務器，並執行一些基本操作來測試其功能。

## 故障排除

如果您遇到問題，請檢查以下事項：

1. 確保 Rundeck CLI 工具可用並且可以正常工作
2. 確保 RUNDECK_CLI_PATH 環境變量指向正確的 Rundeck CLI 工具路徑
3. 確保 RUNDECK_BASE_URL 和 RUNDECK_API_TOKEN 環境變量設置正確
4. 檢查 MCP 設置文件是否正確配置

## 許可證

MIT
