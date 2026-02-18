// src/main.tsx — React 入口：将 React 组件挂载到现有 HTML 中的容器
import { createRoot } from 'react-dom/client'
import SearchBox from './components/SearchBox'

/**
 * 挂载所有 React 组件
 * 在 HTML 中放一个 <div id="react-search"></div>，
 * 这个函数会把 React 搜索组件渲染进去。
 *
 * 未来可以在这里挂载更多组件，比如游戏嵌入等。
 */
function mountReactComponents() {
  // 搜索组件
  const searchContainer = document.getElementById('react-search')
  if (searchContainer) {
    createRoot(searchContainer).render(<SearchBox />)
  }

  // 未来在这里添加更多组件挂载点：
  // const gameContainer = document.getElementById('react-game')
  // if (gameContainer) {
  //   createRoot(gameContainer).render(<GameEmbed />)
  // }
}

// DOM 加载后挂载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactComponents)
} else {
  mountReactComponents()
}
