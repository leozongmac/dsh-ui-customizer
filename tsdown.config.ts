// NOTE: 客户端包构建依赖 harness 仓库的 packages/client/tsdown.client.ts（模块加载器工厂 + CSS 处理）。
// 构建方式见 README「安装」：将本仓库放入 deepseek-harness 的 packages/client/ui-customizer 后执行
//   pnpm --filter @deepseek-ai/dsh-client-ui-customizer exec tsc -b && pnpm --filter @deepseek-ai/dsh-client-ui-customizer bundle
import { clientBundle } from '../tsdown.client.ts'

export default clientBundle('@deepseek-ai/dsh-client-ui-customizer', ['lib/types/index.js'])
