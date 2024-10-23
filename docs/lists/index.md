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

<main>
  <section id="option-area">
    <h3>选择参数</h3>
    <div class="dropdown">
      <label for="totalCount">查字总数：</label>
      <select id="itemsTotal">
        <option value="100">前&nbsp;100字</option>
        <option value="500">前&nbsp;500字</option>
        <option value="1500">前1500字</option>
        <option value="4000">前4000字</option>
      </select>
    </div>

    <div class="dropdown">
      <label for="itemsPerPage">单页字数：</label>
      <select id="itemsPerPage">
        <option value="10">&nbsp;10</option>
        <option value="20">&nbsp;20</option>
        <option value="50">&nbsp;50</option>
        <option value="100">100</option>
      </select>
    </div>

    <div class="dropdown">
      <label for="toggleWubi">隐藏编码：</label>
      <input type="checkbox" id="toggleWubi" onchange="toggleWubiTags()" />
    </div>

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

<script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.1/dist/hanzi-writer.min.js"></script>
<script src="../static/js/utils.js"></script>
<script src="../static/js/list.js"></script>
