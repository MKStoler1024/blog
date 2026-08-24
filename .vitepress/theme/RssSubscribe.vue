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
  border: 1px solid #f59e0b;
  border-radius: 0.75rem;
  color: #92400e !important;
  background: #fffbeb;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

/* The article link style adds a green hover underline to every content link. */
.rss-subscribe .rss-subscribe-button::after {
  display: none;
  content: none;
}

.rss-subscribe-button:hover {
  color: #78350f !important;
  background: #fef3c7;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
  transform: translateY(-2px);
}

.rss-subscribe-button:focus-visible {
  outline: 3px solid rgba(245, 158, 11, 0.4);
  outline-offset: 3px;
}

.rss-subscribe-button > i {
  color: #f97316;
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
  color: #a16207;
  font-size: 0.8rem;
}

html[data-theme="dark"] .rss-subscribe-button {
  border-color: #b45309;
  color: #fde68a !important;
  background: #422006;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

html[data-theme="dark"] .rss-subscribe-button:hover {
  color: #fef3c7 !important;
  background: #522b08;
}

html[data-theme="dark"] .rss-subscribe-button small {
  color: #fcd34d;
}

@media (prefers-reduced-motion: reduce) {
  .rss-subscribe-button {
    transition: none;
  }
}
</style>