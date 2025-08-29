---
icon: material/table-search
title: "五笔拆解常用字"
hide:
  - navigation
  - toc
  - footer
search:
  exclude: true
---

<link rel="stylesheet" type="text/css" href="../static/css/styles2.css" />
<script src="../static/js/hanzi-writer.min.js"></script>

<main>
  <section id="option-area">
    <h3>选择参数</h3>
    <div class="dropdown">
      <label for="itemsTotal">查字总数：</label>
      <select id="itemsTotal">
      </select>
    </div>

    <div class="dropdown">
      <label for="itemsPerPage">单页字数：</label>
      <select id="itemsPerPage">
      </select>
    </div>

    <div class="dropdown">
      <label for="toggleWubi">隐藏编码：</label>
      <input type="checkbox" id="toggleWubi" onchange="toggleWubiTags()" />
    </div>
  </section>

  <section id="note-area">
    <p id="note-warning" class="note">等待加载中……</p>
  </section>

  <section>
    <table id="data-table">
      <thead></thead>
      <tbody></tbody>
    </table>
  </section>

  <div class="pagination" id="pagination">
  </div>
</main>

<script src="../static/js/utils.js"></script>
<script src="../static/js/list.js"></script>
