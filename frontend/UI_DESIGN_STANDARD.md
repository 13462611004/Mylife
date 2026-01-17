# UI设计标准文档

## 📋 文档信息

- **版本**: v1.0
- **更新日期**: 2024年
- **Demo地址**: `/ui-demo`（本地开发环境：`http://localhost:3000/ui-demo`）
- **适用项目**: 追光小慢侠 - 马拉松个人网站

---

## 一、设计哲学

### 1.1 核心原则：统一内核，差异表达

- **统一的基础系统**：所有界面共享相同的字体系统、间距网格、组件形态、圆角风格
- **差异化的主题表达**：每个界面通过色彩主题、视觉元素、交互氛围来体现其独特性
- **现代极简主义**：以留白、简洁、功能性为主导，减少装饰性元素

### 1.2 设计标准（统一元素）

#### 宽度系统（统一）
- **最大内容宽度**：`1200px`（所有界面统一）
- **页面内边距**：`24px`（桌面端），`16px`（移动端）
- **卡片间距**：`24px`
- **元素间距**：基于 `8px` 基础单位的倍数

#### 字体系统（统一）
```css
字体家族: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
         'Hiragino Sans GB', 'Microsoft YaHei', sans-serif

字体层级:
- H1: 32px / 1.2 (极简页面标题)
- H2: 24px / 1.3 (区块标题)
- H3: 20px / 1.4 (卡片标题)
- Body: 16px / 1.6 (正文)
- Caption: 14px / 1.5 (辅助文字)
```

#### 间距系统（统一）
- 基础单位：`8px`
- 间距序列：`8px, 16px, 24px, 32px, 48px`
- 组件内边距：`16px - 24px`
- 区块间距：`32px - 48px`

#### 圆角系统（统一）
- 卡片：`10px - 12px`
- 按钮：`6px`
- 输入框：`6px`
- 标签：`4px`
- 头像/图标：`50%` (圆形)

#### 阴影系统（统一）
```css
卡片阴影: 0 2px 8px rgba(0, 0, 0, 0.08)
悬停阴影: 0 4px 12px rgba(0, 0, 0, 0.12)
按钮阴影: 0 2px 4px rgba(0, 0, 0, 0.1)
```

---

## 二、四个界面的差异化设计

### 2.1 关于界面 - 极简现代风

#### 设计理念
- **目标**：建立信任、传达专业性、提供清晰的信息架构
- **情绪**：冷静、专业、可靠
- **视觉风格**：极致的简洁、大量留白、内容为王

#### 色彩方案
```css
主背景: #FAF9F6 (极浅米白)
次要背景: #FFFFFF (纯白)
主文字: #262626 (深灰)
次要文字: #595959 (中灰)
辅助文字: #8C8C8C (浅灰)
主题色: #2563EB (专业蓝) - 用于链接、图标、强调元素
强调色: #10B981 (成功绿) - 用于数据展示
```

#### 视觉特征
- **背景**：纯白或极浅灰，无纹理、无渐变
- **卡片**：纯白背景，细边框（`1px solid #F0F0F0`）或轻微阴影
- **图标**：线性图标，风格简洁
- **排版**：对齐清晰，层次分明
- **标题**：左侧3px边框，颜色 `#8C8C8C`（灰色）

#### 关键元素
- **数据卡片**：无边框，纯白背景，轻微阴影，hover时上移2px
- **时间线**：按时间倒序排列（最新的在最上面）
- **轮播图**：一次显示4张，支持点击放大预览，无缝循环滚动

---

### 2.2 长路未央 - 运动活力风

#### 设计理念
- **目标**：激发动力、展示成绩、营造运动氛围
- **情绪**：活力、激情、动力、成就感
- **视觉风格**：动态、充满能量、数据驱动

#### 色彩方案
```css
主背景: #FAFBFC (浅灰蓝)
次要背景: #FFFFFF (纯白)
主文字: #1F2937 (深灰)
次要文字: #6B7280 (中灰)
主题色: #F59E0B (活力橙) - 主强调色
次要主题色: #EF4444 (激情红) - 用于重要数据
辅助色: #3B82F6 (能量蓝) - 用于次要元素
```

#### 视觉特征
- **背景**：浅灰蓝，可加入微妙的运动纹理或渐变
- **卡片**：白色背景，橙色/红色边框或渐变背景
- **图标**：实心图标，线条较粗，体现力量感
- **排版**：数据突出，使用大号数字
- **动画**：悬停、点击有较强的反馈动画，体现动感

#### 关键元素
- **领奖台**：3个位置（1、2、3名），左侧、中间、右侧排列，移动端保持横向排列
- **赛事卡片**：支持点击查看详情模态框
- **数据可视化**：使用图表展示跑步数据

---

### 2.3 春夏秋冬 - 温暖社交风

#### 设计理念
- **目标**：营造温暖氛围、促进社交互动、展现生活美好
- **情绪**：温暖、亲切、舒适、生活化
- **视觉风格**：柔和、温馨、充满生活气息

#### 色彩方案
```css
主背景: #FAF9F6 (暖米白)
次要背景: #FFFFFF (纯白)
主文字: #2D2D2D (暖灰黑)
次要文字: #6B6B6B (中性灰)
主题色: 根据季节动态变化
  - 春季: #EC4899 (粉红)
  - 夏季: #10B981 (绿色)
  - 秋季: #F97316 (橙色)
  - 冬季: #3B82F6 (蓝色)
```

#### 视觉特征
- **背景**：暖米白色，可加入微妙的纹理质感
- **卡片**：白色背景，圆角较大，带温暖阴影，左侧季节性彩色边框
- **季节装饰**：根据当前季节动态显示季节图标和装饰元素
- **动画**：柔和的过渡动画，如淡入、轻微缩放
- **交互**：悬浮的emoji装饰、季节渐变背景、动态边框颜色

#### 关键元素
- **季节识别**：根据日期自动判断季节（3-5月春、6-8月夏、9-11月秋、12-2月冬）
- **装饰元素**：季节图标、浮动emoji、渐变线条、彩色边框
- **标签**：使用季节主题色

---

### 2.4 管理界面 - 极简现代风（参考关于界面）

#### 设计理念
- **目标**：提供高效、直观的管理工具，确保数据安全与操作便捷
- **情绪**：清晰、高效、专业、可靠
- **视觉风格**：极致的简洁、功能优先、数据可视化

#### 色彩方案
```css
主背景: #FAF9F6 (极浅米白，与关于界面一致)
次要背景: #FFFFFF (纯白)
主文字: #262626 (深灰)
次要文字: #595959 (中灰)
辅助文字: #8C8C8C (浅灰)
主题色: #1890FF (Ant Design默认蓝)
标题边框: #8C8C8C (灰色，与关于界面一致)
```

#### 视觉特征
- **背景**：纯白或极浅灰，无纹理、无渐变
- **卡片**：纯白背景，无边框，轻微阴影
- **表格**：表头浅灰背景（`#F5F5F5`），悬停时行背景变为 `#FAFAFA`
- **标题**：左侧3px边框，颜色 `#8C8C8C`（灰色），与关于界面一致
- **按钮**：Ant Design默认蓝色（`#1890FF`），圆角6px

#### 关键元素
- **标签页**：激活标签颜色为深灰色（`#262626`），指示器为灰色（`#8C8C8C`）
- **表格**：简洁清晰，hover效果轻微
- **操作按钮**：主要操作使用蓝色，危险操作使用红色

---

## 三、标准化组件库

### 3.1 基础组件

所有组件均基于 Ant Design 4.x，但需要按照统一的设计标准进行样式定制。

#### 按钮 (Button)
```tsx
// 主要按钮
<Button type="primary">主要按钮</Button>

// 默认按钮
<Button>默认按钮</Button>

// 危险按钮
<Button danger>危险按钮</Button>

// 带图标
<Button type="primary" icon={<PlusOutlined />}>带图标</Button>
```

**样式规范**：
- 圆角：`6px`
- 字体：`14px`，字重 `500`
- 悬停：上移 `1-2px`，阴影增强
- 主要按钮：使用主题色

#### 输入框 (Input)
```tsx
// 基本输入框
<Input placeholder="基本输入框" />

// 密码输入框
<Input.Password placeholder="密码输入框" />

// 多行文本
<Input.TextArea rows={4} placeholder="多行文本输入框" />

// 数字输入框
<InputNumber style={{ width: '100%' }} placeholder="数字输入框" />
```

**样式规范**：
- 圆角：`6px`
- 边框：`1px solid #D9D9D9`
- 焦点边框：主题色

#### 选择器 (Select)
```tsx
// 单选
<Select defaultValue="option1" style={{ width: '100%' }}>
  <Option value="option1">选项1</Option>
</Select>

// 多选
<Select mode="multiple" defaultValue={['option1']} style={{ width: '100%' }}>
  <Option value="option1">多选选项1</Option>
</Select>
```

#### 表单 (Form)
```tsx
<Form form={form} layout="vertical">
  <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
    <Input placeholder="请输入用户名" />
  </Form.Item>
</Form>
```

**样式规范**：
- 标签：`14px`，颜色 `#262626`
- 错误提示：红色 `#FF4D4F`

#### 标签 (Tag)
```tsx
<Tag>默认标签</Tag>
<Tag color="success">成功</Tag>
<Tag color="error">错误</Tag>
```

#### 卡片 (Card)
```tsx
<Card title="卡片标题" extra={<a href="#">更多</a>}>
  <p>这是卡片内容区域</p>
</Card>
```

**样式规范**：
- 圆角：`10px - 12px`
- 背景：`#FFFFFF`
- 边框：无或 `1px solid #F0F0F0`
- 阴影：`0 2px 8px rgba(0, 0, 0, 0.08)`
- 内边距：`24px`

#### 表格 (Table)
```tsx
<Table 
  dataSource={dataSource} 
  columns={columns}
  pagination={{ pageSize: 10 }}
/>
```

**样式规范**：
- 表头背景：`#F5F5F5` 或 `#F9FAFB`
- 表头文字：`14px`，字重 `600`，颜色 `#262626`
- 行悬停背景：`#FAFAFA`
- 边框：`1px solid #F0F0F0`

#### 标签页 (Tabs)
```tsx
<Tabs defaultActiveKey="1">
  <TabPane tab="标签1" key="1">内容1</TabPane>
  <TabPane tab="标签2" key="2">内容2</TabPane>
</Tabs>
```

**样式规范**：
- 激活标签：主题色或深灰色，字重 `600`
- 指示器：主题色，高度 `3px`
- 标签文字：`15px`

### 3.2 反馈组件

#### 加载状态 (Spin)
```tsx
<Spin size="small" />
<Spin />
<Spin size="large" />
<Spin tip="加载中...">
  <div>内容区域</div>
</Spin>
```

#### 空状态 (Empty)
```tsx
<Empty description="暂无数据" />
<Empty 
  image={Empty.PRESENTED_IMAGE_SIMPLE} 
  description="简单样式"
/>
```

#### 消息提示 (message)
```tsx
message.success('操作成功')
message.error('操作失败')
message.warning('警告信息')
message.info('提示信息')
```

#### 确认气泡 (Popconfirm)
```tsx
<Popconfirm
  title="确定要删除吗？"
  onConfirm={() => message.success('删除成功')}
  okText="确定"
  cancelText="取消"
>
  <Button danger>删除</Button>
</Popconfirm>
```

### 3.3 数据展示组件

#### 统计数值 (Statistic)
```tsx
<Statistic
  title="已完成赛事"
  value={15}
  suffix="场"
  prefix={<TrophyOutlined />}
  valueStyle={{ color: '#2563EB' }}
/>
```

**样式规范**：
- 标题：`14px`，颜色 `#8C8C8C`
- 数值：`28px`，字重 `600`，颜色主题色或深灰
- 图标：`24px`

#### 进度条 (Progress)
```tsx
<Progress percent={30} />
<Progress percent={50} status="active" />
<Progress percent={100} />
```

#### 评分 (Rate)
```tsx
<Rate defaultValue={3} />
```

#### 徽标 (Badge)
```tsx
<Badge count={5}>
  <Avatar shape="square" size="large" icon={<UserOutlined />} />
</Badge>
```

### 3.4 数据录入组件

#### 日期选择器 (DatePicker)
```tsx
<DatePicker style={{ width: '100%' }} placeholder="日期选择器" />
```

#### 时间选择器 (TimePicker)
```tsx
<TimePicker style={{ width: '100%' }} placeholder="时间选择器" />
```

#### 上传 (Upload)
```tsx
// 基础上传
<Upload>
  <Button icon={<UploadOutlined />}>上传文件</Button>
</Upload>

// 拖拽上传
<Upload.Dragger>
  <p className="ant-upload-drag-icon">
    <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
  </p>
  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
</Upload.Dragger>
```

#### 开关 (Switch)
```tsx
<Switch defaultChecked />
```

#### 单选框 (Radio)
```tsx
<Radio.Group defaultValue="a">
  <Radio value="a">选项A</Radio>
  <Radio value="b">选项B</Radio>
</Radio.Group>
```

#### 复选框 (Checkbox)
```tsx
<Checkbox.Group defaultValue={['a']}>
  <Checkbox value="a">选项A</Checkbox>
  <Checkbox value="b">选项B</Checkbox>
</Checkbox.Group>
```

#### 滑块 (Slider)
```tsx
<Slider defaultValue={30} />
```

### 3.5 导航组件

#### 分页 (Pagination)
```tsx
<Pagination defaultCurrent={1} total={50} />
<Pagination 
  defaultCurrent={1} 
  total={500} 
  showSizeChanger 
  showQuickJumper 
/>
```

#### 下拉菜单 (Dropdown)
```tsx
<Dropdown
  menu={{
    items: [
      { key: '1', label: '菜单项 1' },
      { key: '2', label: '菜单项 2' },
    ]
  }}
>
  <Button>显示菜单</Button>
</Dropdown>
```

### 3.6 其他组件

#### 警告提示 (Alert)
```tsx
<Alert message="成功提示" type="success" showIcon closable />
<Alert message="信息提示" type="info" showIcon />
<Alert message="警告提示" type="warning" showIcon />
<Alert message="错误提示" type="error" showIcon />
```

#### 模态框 (Modal)
```tsx
<Modal
  title="模态框标题"
  open={visible}
  onCancel={() => setVisible(false)}
  onOk={() => setVisible(false)}
>
  <p>这是模态框内容区域</p>
</Modal>
```

#### 抽屉 (Drawer)
```tsx
// 抽屉从页面边缘滑入，覆盖在当前页面之上
// 常用于设置、详情等场景
```

#### 图片 (Image)
```tsx
<Image
  width={200}
  src="https://example.com/image.jpg"
  preview={{
    mask: '预览'
  }}
/>
```

---

## 四、响应式设计

### 4.1 断点设置

```css
/* 移动端 */
@media (max-width: 768px) {
  /* 样式 */
}

/* 平板端 */
@media (min-width: 768px) and (max-width: 1024px) {
  /* 样式 */
}

/* 桌面端 */
@media (min-width: 1024px) {
  /* 样式 */
}
```

### 4.2 移动端适配

- **页面边距**：`16px`
- **卡片间距**：`16px`
- **字体**：`14px - 16px`
- **导航栏**：可折叠或简化

### 4.3 特殊场景

#### 领奖台（长路未央）
- **移动端**：保持横向排列，调整尺寸和间距
- **使用 Flexbox**：`display: flex; justify-content: space-between;`

#### 轮播图（关于界面）
- **桌面端**：一次显示4张
- **平板端**：一次显示3张
- **移动端**：一次显示2张

---

## 五、动画效果

### 5.1 过渡效果

```css
/* 按钮悬停 */
transition: all 0.3s ease;
transform: translateY(-2px);

/* 卡片悬停 */
transition: all 0.3s ease;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
```

### 5.2 淡入淡出

```css
/* 页面加载 */
.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 5.3 特殊动画

#### 轮播图
- 使用 `requestAnimationFrame` 实现平滑滚动
- 支持无缝循环
- 支持暂停/继续

#### 季节装饰（春夏秋冬）
- 浮动动画：`@keyframes float`
- 渐变过渡：`transition: all 0.3s ease`

---

## 六、可访问性

### 6.1 对比度

- 文字与背景对比度至少 `4.5:1`
- 大文字（18px+）对比度至少 `3:1`

### 6.2 交互元素

- 按钮最小点击区域：`44px × 44px`
- 链接有明显的悬停状态

### 6.3 键盘导航

- 所有交互元素可通过键盘访问
- 焦点状态清晰可见

---

## 七、实施指南

### 7.1 CSS变量系统

在 `frontend/src/styles/global.css` 中定义CSS变量：

```css
:root {
  /* 关于页面主题 */
  --about-primary: #F5F5F0;
  --about-secondary: #8C8C8C;
  --about-accent: #262626;
  --about-background: #FAF9F6;
  
  /* 通用设计元素 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  --radius-card: 10px;
  --radius-button: 6px;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
  
  /* 间距 */
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  --spacing-xl: 48px;
  
  /* 宽度 */
  --max-content-width: 1200px;
}
```

### 7.2 组件使用

1. **引入组件**：从 `antd` 引入所需组件
2. **应用样式**：使用对应的CSS类名或内联样式
3. **遵循规范**：按照本文档中的样式规范进行定制

### 7.3 文件结构

```
frontend/src/
├── pages/           # 页面组件
│   ├── Home.tsx     # 关于界面
│   ├── Marathon.tsx # 长路未央界面
│   ├── Moments.tsx  # 春夏秋冬界面
│   └── Admin.tsx    # 管理界面
├── styles/          # 样式文件
│   ├── global.css   # 全局样式和CSS变量
│   ├── Home.css     # 关于界面样式
│   ├── Marathon.css # 长路未央界面样式
│   ├── Moments.css  # 春夏秋冬界面样式
│   └── Admin.css    # 管理界面样式
└── components/      # 公共组件
```

---

## 八、Demo与文档地址

### 8.1 Demo地址

**本地开发环境**：
- URL: `http://localhost:3000/ui-demo`
- 路由: `/ui-demo`

**访问说明**：
1. 启动前端开发服务器：`npm start`（默认端口3000）
2. 在浏览器中访问 `http://localhost:3000/ui-demo`
3. Demo包含：
   - 📦 组件库：展示所有标准化组件
   - 📖 关于界面：极简现代风预览
   - 🏃 长路未央：运动活力风预览
   - 🌸 春夏秋冬：温暖社交风预览
   - ⚙️ 管理界面：极简现代风预览

### 8.2 文档地址

**设计文档**：
- 本文档：`frontend/UI_DESIGN_STANDARD.md`
- 设计理念：`frontend/DESIGN_PHILOSOPHY.md`（参考）
- 设计风格：`frontend/DESIGN_STYLE.md`（参考）

### 8.3 代码参考

**关键文件**：
- Demo页面：`frontend/src/pages/UIDesignDemo.tsx`
- Demo样式：`frontend/src/styles/UIDesignDemo.css`
- 全局样式：`frontend/src/styles/global.css`
- 各页面样式：
  - `frontend/src/styles/Home.css`（关于界面）
  - `frontend/src/styles/Marathon.css`（长路未央界面）
  - `frontend/src/styles/Moments.css`（春夏秋冬界面）
  - `frontend/src/styles/Admin.css`（管理界面）

---

## 九、开发注意事项

### 9.1 样式优先级

1. **全局样式**：通过CSS变量定义
2. **页面样式**：通过页面专用CSS文件
3. **组件样式**：通过Ant Design的className覆盖

### 9.2 组件定制

- 优先使用Ant Design提供的props和className
- 避免直接修改Ant Design的全局样式
- 使用CSS变量保持主题一致性

### 9.3 响应式处理

- 使用Ant Design的 `Row` 和 `Col` 组件进行布局
- 使用CSS媒体查询处理特殊情况
- 测试不同屏幕尺寸的显示效果

### 9.4 性能优化

- 使用懒加载（lazy loading）减少初始加载时间
- 图片使用适当的格式和尺寸
- 避免不必要的重渲染

---

## 十、更新日志

### v1.0 (2024年)
- 初始版本
- 包含四个界面的完整设计规范
- 包含标准化组件库
- 包含Demo页面

---

## 十一、联系方式

如有问题或建议，请联系项目负责人。

**祝开发顺利！** 🎉
