### wonderfulCss

### 使用 gulp 生成基础目录

### 功能

- [x] ejs
- [x] 模块化
- [x] react 语法
- [x] scss 压缩
- [x] html 引用
- [x] 文件监控
- [x] 自动生成导航文件

### 使用

```bash
gulp # 启动服务
```

### 不足

> 每次打包的时候都需要重新编译 jsx 文件， 引入 React, ReactDOM 后打包的速度就很慢，由于水平有限，只能将他们在 html 标签中引入，使 React ReactDOM 成为全局对象
