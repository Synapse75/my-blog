#!/usr/bin/env node
// new.js — 快速创建新文章
// 用法:
//   node new.js "文章标题"
//   node new.js "文章标题" --category 技术
//   node new.js "文章标题" --tags 标签1,标签2 --category 随笔

const fs = require('fs')
const path = require('path')

const POSTS_DIR = path.join(__dirname, 'posts')

const args = process.argv.slice(2)
if (args.length === 0 || args[0] === '--help') {
  console.log(`
用法: node new.js "文章标题" [选项]

选项:
  --tags 标签1,标签2    添加标签（逗号分隔）
  --category 分类名     设置分类（自动创建对应文件夹）

示例:
  node new.js "学习 JavaScript"
  node new.js "我的日记" --category 随笔
  node new.js "Tech Post" --tags JS,前端 --category 技术
`)
  process.exit(0)
}

let title = ''
let tags = []
let category = ''

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tags' && args[i + 1]) {
    tags = args[++i].split(',').map(s => s.trim()).filter(Boolean)
  } else if (args[i] === '--category' && args[i + 1]) {
    category = args[++i].trim()
  } else if (!args[i].startsWith('--')) {
    title = args[i]
  }
}

if (!title) {
  console.error('请提供文章标题')
  process.exit(1)
}

// 生成文件名
function toFileName(str) {
  let name = str
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!name || !/[a-z0-9]/.test(name)) {
    name = 'new-post'
  }
  return name + '.md'
}

const fileName = toFileName(title)
const targetDir = category ? path.join(POSTS_DIR, category) : POSTS_DIR

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

const filePath = path.join(targetDir, fileName)

if (fs.existsSync(filePath)) {
  console.error(`文件已存在: ${path.relative(POSTS_DIR, filePath)}`)
  process.exit(1)
}

// 构建文件内容：只在有 tags 时才写 front matter
let content = ''

if (tags.length > 0) {
  content += '---\n'
  content += 'tags:\n'
  tags.forEach(tag => { content += `  - ${tag}\n` })
  content += '---\n\n'
}

content += `# ${title}\n\n`

fs.writeFileSync(filePath, content, 'utf-8')

const relPath = path.relative(POSTS_DIR, filePath).replace(/\\/g, '/')
console.log(`已创建: posts/${relPath}`)
if (category) console.log(`   分类: ${category}`)
if (tags.length) console.log(`   标签: ${tags.join(', ')}`)
console.log(`\n打开文件直接在 # ${title} 下面写正文`)
console.log(`   写完后运行 node build.js`)
