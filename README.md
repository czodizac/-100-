# 是男人就撑过100波

这是我做的第一个浏览器飞机弹幕游戏，由我和 Codex GPT-5.5 协作完成。

玩家驾驶战机穿越霓虹云海，在一波又一波敌机和弹幕里生存。目标很直接：撑到第 100 波。

## 玩法特色

- 波次挑战：敌机强度会随波次逐步提升。
- 火力成长：击杀和补给会提升火力，子弹花样会不断升级。
- 受击惩罚：一旦被敌机或子弹碰到，火力立刻回到 Lv.1。
- 补给系统：包含火力、修复、护盾和推进加速。
- 积分榜：记录每局分数和坚持到的波次。
- 动态舞台：每 10 波更换背景与音乐氛围。
- 音量控制：可分别调节音乐和音效。

## 操作方式

- `WASD` / 方向键：移动
- 鼠标或触屏拖动：移动
- 空格：释放星环脉冲

## 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问本地开发地址，通常是 `http://localhost:5174/` 或终端显示的地址。

## 构建

```bash
npm run build
```

## 技术栈

- TypeScript
- Vite
- Phaser 3
- Web Audio API

## 音乐素材

音乐来自 OpenGameArt，具体来源和授权见 [public/audio/ATTRIBUTION.md](public/audio/ATTRIBUTION.md)。

## 开源协议

MIT License
