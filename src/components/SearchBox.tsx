// src/components/SearchBox.tsx — React 搜索组件
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Post } from '../types'

/** 搜索结果项 */
interface SearchResult {
  post: Post
  hash: string
}

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 搜索逻辑
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const keyword = q.toLowerCase()
    const posts: Post[] = globalThis.localPosts || []

    const matched = posts
      .filter(p =>
        (p.title || '').toLowerCase().includes(keyword) ||
        (p.excerpt || '').toLowerCase().includes(keyword) ||
        (p.category || '').toLowerCase().includes(keyword) ||
        (p.tags || []).some(t => t.name.toLowerCase().includes(keyword))
      )
      .slice(0, 8)
      .map(post => ({
        post,
        hash: globalThis.getPostHash(post),
      }))

    setResults(matched)
    setIsOpen(true)
    setActiveIndex(-1)
  }, [])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  // 点击外部关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => (i + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => (i - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && results[activeIndex]) {
          selectResult(results[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const selectResult = (result: SearchResult) => {
    globalThis.navigateTo(result.hash)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="search-container" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="搜索文章..."
        autoComplete="off"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-result-item">
              <span className="search-result-title">无匹配结果</span>
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={r.post.id}
                className={`search-result-item ${i === activeIndex ? 'active' : ''}`}
                onClick={() => selectResult(r)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className="search-result-title">{r.post.title}</div>
                <div className="search-result-excerpt">
                  {(r.post.excerpt || '').slice(0, 60)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
