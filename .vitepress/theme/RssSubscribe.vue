<template>
  <div class="rss-subscribe">
    <a
      class="rss-subscribe-button"
      href="/feed.rss"
      target="_blank"
      rel="noopener"
      aria-label="通过 RSS 订阅本站最新文章"
    >
      <i class="fas fa-rss" aria-hidden="true"></i>
      <span>
        <strong>订阅 RSS</strong>
        <small>及时获取本站最新文章</small>
      </span>
    </a>
  </div>
</template>

<style scoped>
.rss-subscribe {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.rss-subscribe-button {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  color: var(--color-text) !important;
  background: var(--color-surface-muted);
  box-shadow: 0 2px 8px var(--color-shadow);
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

/* The article link style adds a green hover underline to every content link. */
.rss-subscribe .rss-subscribe-button::after {
  display: none;
  content: none;
}

.rss-subscribe-button:hover {
  color: var(--color-accent-strong) !important;
  background: var(--color-surface);
  border-color: var(--color-accent);
  box-shadow: 0 4px 14px var(--color-shadow);
  transform: translateY(-2px);
}

.rss-subscribe-button:focus-visible {
  outline: 3px solid rgba(217, 112, 42, 0.4);
  outline-offset: 3px;
}

.rss-subscribe-button > i {
  color: var(--color-accent);
  font-size: 1.65rem;
}

.rss-subscribe-button > span {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  line-height: 1.4;
}

.rss-subscribe-button strong {
  font-size: 1rem;
}

.rss-subscribe-button small {
  color: var(--color-gray);
  font-size: 0.8rem;
}

html[data-theme="dark"] .rss-subscribe-button {
  border-color: var(--color-border);
  color: var(--color-text) !important;
  background: var(--color-surface-muted);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

html[data-theme="dark"] .rss-subscribe-button:hover {
  color: var(--color-featured) !important;
  background: var(--color-surface);
  border-color: var(--color-featured);
}

html[data-theme="dark"] .rss-subscribe-button small {
  color: var(--color-gray);
}

@media (prefers-reduced-motion: reduce) {
  .rss-subscribe-button {
    transition: none;
  }
}
</style>