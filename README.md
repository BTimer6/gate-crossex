# Gate CrossEx 本地交易终端 | Gate CrossEx Local Trading Terminal

一个本地运行的开源 Gate CrossEx 行情与实盘交易桌面界面。

A local, open-source desktop interface for Gate CrossEx market data and live trading.

> **仅支持实盘：** 所有已接受的订单和转账都是真实操作。本项目独立开发，并非 Gate 官方产品。交易可能造成重大损失。
>
> **Live trading only:** accepted orders and transfers are real. This is an independent project, not an official Gate product. Trading can result in substantial loss.

## 什么是 CrossEx？ | What is CrossEx?

CrossEx 将 Gate.io、Binance、OKX、Bybit、Kraken、Hyperliquid 和 Deribit 接入同一个跨所账户，在这些交易所之间共享保证金和可用资金，减少在每个平台分别预留资金的需要，从而提高资金效率。[注册 CrossEx](https://www.gate.com/zh/crossex?ref=QUANTGUY)。

CrossEx connects Gate.io, Binance, OKX, Bybit, Kraken, Hyperliquid, and Deribit through one cross-exchange account, sharing margin and available capital across these venues. This reduces the need to reserve funds separately on each exchange and improves capital efficiency. [Sign up for CrossEx](https://www.gate.com/crossex?ref=QUANTGUY).

## 主要功能 | What it does

- 实时图表、订单簿、成交、资金费率和持仓量。<br>
  Live charts, order books, trades, funding rates, and open interest.
- 跨平台资产、余额、持仓、订单、成交和账户流水。<br>
  Cross-venue portfolio, balances, positions, orders, fills, and account activity.
- 直接下单、资金划转、配对对冲、价差机器人和 ADR 溢价策略。<br>
  Direct orders, fund transfers, paired hedges, spread bots, and ADR premium strategies.
- 仅在你的电脑上运行，只绑定 `127.0.0.1`，不包含遥测或云端后端。<br>
  Runs on your computer, binds only to `127.0.0.1`, and has no telemetry or hosted backend.

## 安装 | Install

运行一条引导命令即可下载源码、项目专用的 Node.js 运行时以及锁文件固定的全部依赖项。无需预先安装 Node.js、npm、Git、Docker，也无需管理员权限或 `sudo`。

Run one bootstrap command to download the source, a private Node.js runtime, and all lockfile-pinned dependencies. You do not need Node.js, npm, Git, Docker, administrator access, or `sudo`.

### macOS 或 Linux — ARM64 和 x64 | macOS or Linux — ARM64 and x64

打开**终端**，粘贴以下命令，然后按下 Return：

Open **Terminal**, paste this command, and press Return:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/your-quantguy/gate-crossex/main/bootstrap.sh)"
```

Linux 引导程序支持基于 glibc 的发行版。

The Linux bootstrap supports glibc-based distributions.

### Windows — x64 和 ARM64 | Windows — x64 and ARM64

打开 **PowerShell**，粘贴以下命令，然后按下 Enter：

Open **PowerShell**, paste this command, and press Enter:

```powershell
& ([scriptblock]::Create((Invoke-RestMethod https://raw.githubusercontent.com/your-quantguy/gate-crossex/main/bootstrap.ps1)))
```

### 启动本地网页应用 | Start the local web app

#### macOS 或 Linux | macOS or Linux

在 macOS 或 Linux 上，引导程序默认安装到 `~/gate-crossex`。安装完成后，在**终端**中运行：

On macOS or Linux, the bootstrap installs into `~/gate-crossex` by default. After installation, run these commands in **Terminal**:

```bash
cd ~/gate-crossex && ./run
```

#### Windows | Windows

在 Windows 上，引导程序默认安装到 `$HOME\gate-crossex`。安装完成后，在 **PowerShell** 中运行：

On Windows, the bootstrap installs into `$HOME\gate-crossex` by default. After installation, run these commands in **PowerShell**:

```powershell
Set-Location "$HOME\gate-crossex"; .\run.ps1
```

启动器会构建已下载的源码，等待仅限本机访问的网页应用通过健康检查，然后在浏览器中打开。按终端中的 `Ctrl+C` 即可停止。引导程序会使用 Node.js 官方发布的 SHA-256 校验值验证项目专用运行时。以上命令会运行本仓库中的远程脚本；如安全策略有要求，请先检查脚本内容。

The launcher builds the checked-out source, waits for the loopback-only web app to become healthy, and opens it in your browser. Press `Ctrl+C` in the terminal to stop it. The bootstrap verifies the private Node.js runtime against Node.js's published SHA-256 checksums. These commands run a remote script from this repository; inspect it first if required by your security policy.

如需选择其他安装目录，请在运行引导程序前将 `GCT_INSTALL_DIR` 设置为绝对路径。贡献者命令和 Docker 用法请参阅[本地开发文档](docs/local-development.md)。

To choose another installation folder, set `GCT_INSTALL_DIR` to an absolute path before running the bootstrap. See [local development](docs/local-development.md) for contributor and Docker commands.

## 网页应用地址 | Web app URL

Gate CrossEx 运行时，请在浏览器中打开 **http://127.0.0.1:17840**。这是你当前电脑上的私有本地地址，不是公网网站，其他设备无法访问。如果默认端口被占用，或你配置了其他端口，请使用启动器或安装器显示的 **Gate CrossEx is ready** 或 **Local URL** 完整地址。

Open **http://127.0.0.1:17840** in a browser while Gate CrossEx is running. This is a private address on your own computer, not a public website; another device cannot open it. If the default port is unavailable or you configured a different port, use the exact **Gate CrossEx is ready** or **Local URL** address printed by the launcher or installer.

应用通过健康检查后，`cd ~/gate-crossex && ./run` 和 `Set-Location "$HOME\gate-crossex"; .\run.ps1` 启动命令会自动打开该地址。

The `cd ~/gate-crossex && ./run` and `Set-Location "$HOME\gate-crossex"; .\run.ps1` commands open this URL automatically after the app becomes healthy.

## 首次使用 | First use

1. 打开 Gate CrossEx 并确认风险提示，选择**只读模式**或**实盘交易**。每次重启都会恢复为锁定状态。<br>
   Open Gate CrossEx and accept the risk notice. Choose **read-only** or **live trading**. Every restart returns to the locked state.
2. 使用 **Open secure credential setup** 添加专用 Gate APIv4 密钥，建议保存到系统钥匙串或凭据管理器。<br>
   Use **Open secure credential setup** to add a dedicated Gate APIv4 key. The OS keychain is recommended.
3. 仅授予所需的 CrossEx 权限。资金划转需要钱包读写权限；请勿授予提现权限。<br>
   Grant only the CrossEx permissions you need. Transfers require wallet read-write permission; never grant withdrawal permission.

凭据保存在系统钥匙串或凭据管理器，或由你明确选择的本地 `.env` 文件中，绝不会发送给维护者。

Credentials remain in the OS keychain or an explicitly selected local `.env` file. They are never sent to the maintainer.

## 更新、停止与卸载 | Update, stop, and uninstall

请在 `~/gate-crossex` 或引导安装时选择的自定义目录中运行以下命令。

Run these commands from `~/gate-crossex`, or from the custom folder selected during bootstrap.

| 操作<br>Action | macOS 或 Linux<br>macOS or Linux | Windows PowerShell |
| --- | --- | --- |
| 更新<br>Update | `cd ~/gate-crossex && ./run update` | `Set-Location "$HOME\gate-crossex"; .\run.ps1 update` |
| 停止<br>Stop | `cd ~/gate-crossex && ./run stop` | `Set-Location "$HOME\gate-crossex"; .\run.ps1 stop` |

更新命令会暂存新的源码快照和项目专用运行时，安装依赖并构建应用，然后安全停止当前进程、创建经过验证的数据库备份并启用新源码。它会保留 `.local-data`、日志和 `.env`。更新不会自动重启应用；完成后请运行 `cd ~/gate-crossex && ./run`，或在 Windows 上运行 `Set-Location "$HOME\gate-crossex"; .\run.ps1`。

The update command stages a fresh source snapshot and private runtime, installs dependencies, builds the app, safely stops the current process, creates a verified database backup, and then activates the new source tree. It preserves `.local-data`, logs, and `.env`. It does not restart the app; afterward, run `cd ~/gate-crossex && ./run`, or on Windows run `Set-Location "$HOME\gate-crossex"; .\run.ps1`.

引导安装不会创建需要卸载的系统服务。请先停止应用并备份需要保留的内容，然后手动删除安装目录。删除该目录也会删除其中的 `.local-data` 数据库、凭据、日志和 `.env`。

A bootstrap installation has no system service to uninstall. Stop it, back up anything you want to keep, and then remove its folder manually. Deleting that folder also deletes its `.local-data` database, credentials, logs, and `.env`.

## 安全与披露 | Security and disclosure

- 后端仅限本机访问；应用前端 JavaScript 永远不会接触已保存的 API 密钥。<br>
  The backend is local-only; application JavaScript never receives stored API secrets.
- 发布包会校验哈希，但目前尚未经过 Apple 公证或 Windows Authenticode 签名。<br>
  Release archives are checksum-verified but are not yet Apple-notarized or Windows Authenticode-signed.
- Gate 可能向维护者支付 API Broker 返佣；这不会改变你的手续费，也不会授予维护者账户访问权限。<br>
  Gate may pay the maintainer an API Broker rebate; this does not change your fees or grant account access.

请通过 [GitHub 私密漏洞报告](SECURITY.md)提交安全问题。请勿公开发布 API 密钥、账户标识、数据库或未脱敏日志。

Report vulnerabilities through [GitHub private vulnerability reporting](SECURITY.md). Never post API keys, account identifiers, databases, or unredacted logs publicly.

## 项目信息 | Project information

- [架构](docs/architecture.md)<br>
  [Architecture](docs/architecture.md)
- [发布流程](docs/RELEASING.md)<br>
  [Release process](docs/RELEASING.md)
- [第三方声明](THIRD_PARTY_NOTICES.md)<br>
  [Third-party notices](THIRD_PARTY_NOTICES.md)
- [GNU AGPL-3.0-only 开源许可证](LICENSE)<br>
  [GNU AGPL-3.0-only license](LICENSE)

版权所有 © 2026 yourQuantGuy 及贡献者。

Copyright © 2026 yourQuantGuy and contributors.
