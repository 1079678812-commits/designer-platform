# 遗留问题清单

## 🔧 需要外部配置/申请的（非代码问题）

### 1. 飞书 OAuth 登录
- **状态**: 代码已完成，需配置飞书应用
- **步骤**:
  1. 访问 https://open.feishu.cn/app 创建企业自建应用
  2. 添加"网页应用"，回调地址: `https://你的域名/api/auth/feishu/callback`
  3. 权限: `contact:user.base:readonly`
  4. 获取 App ID 和 App Secret
  5. 写入 `.env`: `FEISHU_APP_ID=xxx` / `FEISHU_APP_SECRET=xxx`
- **预估时间**: 0.5小时（申请+配置）

### 2. 微信登录
- **状态**: 未开发
- **需要**: 微信开放平台注册应用，获取 AppID/AppSecret
- **开发量**: 约0.5天（OAuth流程与飞书类似）

### 3. 微信支付 / 支付宝
- **状态**: 代码框架已完成（PaymentModal + API），需接真实SDK
- **步骤**:
  1. 微信支付: https://pay.weixin.qq.com 开通商户号
  2. 支付宝: https://open.alipay.com 开通支付能力
  3. 安装SDK: `npm install wechatpay-node-v3 alipay-sdk`
  4. 配置证书和密钥
  5. 修改 `/api/payments` 调用真实支付接口
  6. 实现异步回调 `/api/payments/callback`
- **预估时间**: 3-5天

### 4. 阿里云 OSS 文件存储
- **状态**: 代码框架已完成（`upload-service.ts`），需安装SDK和配置
- **步骤**:
  1. 开通阿里云 OSS: https://oss.console.aliyun.com
  2. 创建 Bucket（建议：标准存储、私有读写）
  3. 安装SDK: `npm install ali-oss`
  4. 配置 `.env`:
     ```
     USE_OSS=true
     OSS_ACCESS_KEY_ID=xxx
     OSS_ACCESS_KEY_SECRET=xxx
     OSS_BUCKET=designer-platform
     OSS_REGION=oss-cn-hangzhou
     ```
  5. 实现 `uploadToOSS` 函数（`src/lib/upload-service.ts`）
- **预估时间**: 0.5天

### 5. 邮件服务
- **状态**: 代码已完成（`email-service.ts`），需配置 SMTP
- **推荐方案**:
  - 阿里云 DirectMail（国内最稳定）
  - SendGrid（海外）
  - 腾讯云 SES
- **配置 `.env`**:
  ```
  EMAIL_PROVIDER=smtp
  SMTP_HOST=smtpdm.aliyun.com
  SMTP_PORT=465
  SMTP_USER=noreply@yourdomain.com
  SMTP_PASS=xxx
  SMTP_FROM="设计师平台 <noreply@yourdomain.com>"
  ```
- **预估时间**: 0.5小时

### 6. 飞书 Webhook 通知
- **状态**: 代码已完成，需创建飞书机器人
- **步骤**:
  1. 在飞书群中添加"自定义机器人"
  2. 获取 Webhook URL
  3. 配置 `.env`: `FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx`
- **预估时间**: 10分钟

---

## 🚀 部署相关

### 7. PostgreSQL 数据库
- **状态**: 代码支持，改环境变量即可切换
- **步骤**:
  1. 安装 PG 或使用云数据库（推荐阿里云 RDS）
  2. 修改 `prisma/schema.prisma`: `provider = "postgresql"`
  3. 修改 `.env`: `DATABASE_URL=postgresql://user:pass@host:5432/designer`
  4. 运行 `npx prisma migrate deploy`
- **预估时间**: 1小时

### 8. 域名 + HTTPS
- **需要**: 购买域名 + SSL证书（Let's Encrypt免费）
- **推荐**: Vercel（自动HTTPS）/ 阿里云ECS + Nginx

### 9. 定时备份
- **状态**: 脚本已完成 (`scripts/backup.sh`)
- **配置**: 添加 crontab `0 2 * * * cd /path/to/project && bash scripts/backup.sh`

---

## 📊 可选优化

| 项目 | 优先级 | 工作量 | 说明 |
|------|--------|--------|------|
| WebSocket 实时推送 | P2 | 1天 | 代码已预留，需接 socket.io |
| 国际化 (i18n) | P3 | 2天 | next-intl |
| 操作日志完善 | P2 | 0.5天 | 给更多API加 auditLog |
| 性能监控 (APM) | P3 | 0.5天 | Sentry / 阿里云ARMS |
| CDN 加速 | P3 | 0.5天 | 静态资源 + 图片 |
| 自动化E2E测试 | P3 | 2天 | Playwright |
