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
  border: 1px solid #e8b21b;
  border-radius: 0.75rem;
  color: #8a4a0c !important;
  background: #fffaea;
  box-shadow: 0 2px 8px rgba(232, 178, 27, 0.18);
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

/* The article link style adds a green hover underline to every content link. */
.rss-subscribe .rss-subscribe-button::after {
  display: none;
  content: none;
}

.rss-subscribe-button:hover {
  color: #6b3607 !important;
  background: #fff3c9;
  box-shadow: 0 4px 14px rgba(232, 178, 27, 0.28);
  transform: translateY(-2px);
}

.rss-subscribe-button:focus-visible {
  outline: 3px solid rgba(217, 112, 42, 0.4);
  outline-offset: 3px;
}

.rss-subscribe-button > i {
  color: #d9702a;
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
  color: #a9711a;
  font-size: 0.8rem;
}

html[data-theme="dark"] .rss-subscribe-button {
  border-color: #8a6a1c;
  color: #f8dd8f !important;
  background: #3a2c12;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

html[data-theme="dark"] .rss-subscribe-button:hover {
  color: #fff3c9 !important;
  background: #4a3a18;
}

html[data-theme="dark"] .rss-subscribe-button small {
  color: #f5cf5a;
}

@media (prefers-reduced-motion: reduce) {
  .rss-subscribe-button {
    transition: none;
  }
}
</style>