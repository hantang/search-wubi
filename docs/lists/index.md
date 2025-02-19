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
        <option value="100">高频 100字</option>
        <option value="500">高频 500字</option>
        <option value="1500">高频1500字</option>
        <option value="4000">高频4000字</option>
        <option value="level1">规范一级字</option>
        <option value="level2">规范二级字</option>
        <option value="level3">规范三级字</option>
        <option value="fanti">常见繁体字</option>
        <option value="more">更多表外字</option>
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
