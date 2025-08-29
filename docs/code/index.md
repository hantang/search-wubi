---
icon: material/card-bulleted
title: "五笔编码反查"
hide:
  - navigation
  - toc
  - footer
search:
  exclude: true
---

<link rel="stylesheet" type="text/css" href="../static/css/styles2.css" />
<style>
#data-table td ul {
  list-style-type: decimal;
  font-size: 1rem;
}
</style>

<main>
  <section>
    <form id="search-form" class="search-container">
    <input type="text" id="query-text" placeholder="请输入五笔编码（空格或英文逗号等分隔）..." />
      <button type="submit" id="query-button">🔍️</button>
    </form>
  </section>

  <section id="note-area">
    <p id="note-warning" class="note"></p>
  </section>

  <section>
    <table id="data-table">
      <thead></thead>
      <tbody></tbody>
    </table>
  </section>
</main>

<script src="../static/js/utils.js"></script>
<script src="../static/js/code.js"></script>
