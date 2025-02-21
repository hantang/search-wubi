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
        <option value="100">高频&nbsp;&nbsp;100字</option>
        <option value="500">高频&nbsp;&nbsp;500字</option>
        <option value="1500">高频1500字</option>
        <option value="medium">中频3000字</option>
        <option value="level1a">规范一级字㊤</option>
        <option value="level1b">规范一级字㊦</option>
        <option value="level2">规范二级字</option>
        <option value="level3">规范三级字</option>
        <option value="fanti">常见繁/异体字</option>
        <option value="strokes">笔画/键名字</option>
        <option value="units">五笔成根字</option>
        <option value="monochar">独体字</option>
        <option value="component">合体字部件</option>
        <option value="surname">新百家姓</option>
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

<script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js"></script>
<script src="https://cdn.jsdmirror.com/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js"></script>
<!-- <script src="../static/js/hanzi-writer.min.js"></script> -->
<script src="../static/js/utils.js"></script>
<script src="../static/js/list.js"></script>
