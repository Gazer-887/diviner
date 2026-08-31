// 二期扩展预留：用户数据/访问统计接入 CloudBase 云函数
//
// 启用方式：
//   1. 删除本目录的注释标记
//   2. 在 next.config.ts 中移除 `output: "export"`（或改为 CloudBase 托管适配）
//   3. 在 CloudBase 控制台开通云函数与云数据库
//   4. 在 src/lib/cloudbase.ts 中封装 SDK 调用
//   5. 在玩法页 result 后调用 POST /api/record 保存结果摘要
//
// MVP 阶段刻意保留空目录占位 + 此说明文档，确保二期扩展时无需重新设计路由。
//
// 预期接口草案：
//   POST /api/record   - 保存占卜结果摘要（去标识化）
//   GET  /api/stats    - 匿名访问统计（PV/UV/玩法分布）
//   POST /api/share    - 服务端生成可分享的结果卡片（PNG）