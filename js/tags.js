let allTags = []
let currentPostTags = []

async function loadAllTags() {
  const { data, error } = await sb
    .from('tags')
    .select('*')
    .order('usage_count', { ascending: false })

  if (error) console.error(error)
  allTags = data || []
}

// ========== 标签页面渲染 ==========
function renderTagsPage() {
  const container = document.getElementById('tagsPageList')
  if (!container) return
  container.innerHTML = ''

  if (allTags.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无标签</p>'
    return
  }

  allTags.forEach(tag => {
    const tagEl = document.createElement('div')
    tagEl.className = 'tags-page-item'
    tagEl.onclick = () => filterByTag(tag.id)

    const name = document.createElement('span')
    name.className = 'tags-page-item-name'
    name.textContent = tag.name

    const count = document.createElement('span')
    count.className = 'tags-page-item-count'
    count.textContent = tag.usage_count + ' 篇文章'

    tagEl.appendChild(name)
    tagEl.appendChild(count)
    container.appendChild(tagEl)
  })
}

// 点击标签后跳转到文章 tab 并筛选
function filterByTag(tagId) {
  selectedTagId = tagId
  // 切换到文章 tab
  switchTab('posts')
  displayPostsByTag()
}

function renderEditorTags() {
  const tagsList = document.getElementById('currentTagsList')
  tagsList.innerHTML = ''
  
  allTags.forEach(tag => {
    const isActive = currentPostTags.some(t => t.id === tag.id)
    const div = document.createElement('div')
    div.className = 'tag-badge' + (isActive ? ' active' : '')
    div.textContent = tag.name
    div.onclick = () => toggleTag(tag)
    tagsList.appendChild(div)
  })
}

function toggleTag(tag) {
  const idx = currentPostTags.findIndex(t => t.id === tag.id)
  if (idx !== -1) {
    currentPostTags.splice(idx, 1)
  } else {
    currentPostTags.push(tag)
  }
  renderEditorTags()
}

async function handleAddTag(tagName) {
  tagName = tagName.trim()
  if (!tagName) return

  let tag = allTags.find(t => t.name === tagName)
  
  if (!tag) {
    const { data, error } = await sb
      .from('tags')
      .insert({ name: tagName })
      .select()
      .maybeSingle()
    
    if (error) return alert(error.message)
    tag = data
    allTags.push(tag)
  }

  if (!currentPostTags.find(t => t.id === tag.id)) {
    currentPostTags.push(tag)
  }

  renderEditorTags()
}

async function loadPostTags(postId) {
  const { data, error } = await sb
    .from('post_tags')
    .select('tags(*)')
    .eq('post_id', postId)

  if (error) console.error(error)
  currentPostTags = (data || []).map(pt => pt.tags)
  renderEditorTags()
}