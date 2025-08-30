import { fetchCharData, getListData, renderCharList, plotWubiSegments, renderFontSVG, toggleWubiTags } from "./core/utils.js";

const OPTION_CHAR_TABLE = [
  { value: "100", name: "高频&nbsp;&nbsp;100字" },
  { value: "500", name: "高频&nbsp;&nbsp;500字" },
  { value: "1500", name: "高频1500字" },
  { value: "medium", name: "中频3000字" },
  { value: "level1a", name: "规范一级字㊤" },
  { value: "level1b", name: "规范一级字㊦" },
  { value: "level2", name: "规范二级字" },
  { value: "level3", name: "规范三级字" },
  { value: "fanti", name: "常见繁/异体字" },
  { value: "strokes", name: "笔画/键名字" },
  { value: "units", name: "五笔成根字" },
  { value: "monochar", name: "独体字" },
  { value: "component", name: "合体字部件" },
  { value: "surname", name: "新百家姓" },
  { value: "more", name: "更多表外字" }
]

const OPTION_ITEM_PAGE = [10, 20, 50, 100]

function initListTable() {
  // Initialize itemsTotal select
  const itemsTotalSelect = document.getElementById('itemsTotal');
  const itemsPerPageSelect = document.getElementById('itemsPerPage');
  if (itemsTotalSelect) {
    itemsTotalSelect.innerHTML = ''; // Clear existing options
    OPTION_CHAR_TABLE.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.innerHTML = option.name; // Using innerHTML to preserve &nbsp;
      itemsTotalSelect.appendChild(optionElement);
    });

    if (itemsPerPageSelect) {
      itemsPerPageSelect.innerHTML = '';
      OPTION_ITEM_PAGE.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = String(option);
        optionElement.innerHTML = option;
        itemsPerPageSelect.appendChild(optionElement);
      });
    }
  }

  // Initialize table
  const headers = [
    "序号",
    "汉字",
    "五笔编码", // 全码 + 简码 + 容错
    "字根拆解",
    "字根图解",
  ];
  const tableHead = document.querySelector("#data-table thead");
  tableHead.innerHTML = "";
  const headRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headRow.appendChild(th);
  });
  tableHead.append(headRow);
}

function createListTableRow(index, char, charInfo, configData, imgPath, svgData, available) {
  const row = document.createElement("tr");

  const indexCell = document.createElement("td");
  const charCell = document.createElement("td");
  const codeCell = document.createElement("td");
  const extraCell = document.createElement("td");
  const sliceCell = document.createElement("td");

  indexCell.textContent = index + 1;

  // charCell.innerHTML = `<span>${char}</span>`;
  if (svgData !== null && svgData !== undefined) {
    const svgCell = renderFontSVG(char, svgData.path);
    charCell.append(svgCell);
  }
  const charSpan = document.createElement("span");
  charSpan.textContent = char;
  charCell.append(charSpan);

  const wubiDiv = getListData(
    ["全码", "简码", "容错"],
    [charInfo.code, charInfo.shortCode, charInfo.faultCode],
    configData
  );
  wubiDiv.className = "wubiCode";
  codeCell.appendChild(wubiDiv);
  extraCell.appendChild(
    getListData(["拆解", "备注"], [charInfo.units, charInfo.unitType], configData)
  );

  row.appendChild(indexCell);
  row.appendChild(charCell);
  row.appendChild(codeCell);
  row.appendChild(extraCell);
  row.appendChild(sliceCell);

  if (available) {
    HanziWriter.loadCharacterData(char)
      .then((charData) => {
        const imgDiv = document.createElement("div");
        imgDiv.className = "segment";
        plotWubiSegments(imgDiv, charData, charInfo.segments, imgPath);
        sliceCell.appendChild(imgDiv);
      })
      .catch((error) => {
        console.error("Read JSON data failed:", error);
      });
  }

  return row;
}

async function updateListTableRows(start, inputChars, charData, configData, basedir) {
  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  // const filteredChars = inputChars;
  renderCharList(inputChars, start, true, basedir, charData, configData, tableBody, createListTableRow);
}

document.addEventListener("DOMContentLoaded", async () => {
  const basedir = "..";
  const datafile = `${basedir}/data/data.json`;

  const data = await fetchCharData(datafile);
  const charData = data.chars;
  const configData = data.config;
  const topData = data.chars.top;

  const paragraphs = [""];
  const note = document.getElementById("note-area");
  const para = document.getElementById("note-warning");

  para.innerHTML = "";
  paragraphs.forEach((text) => {
    const more = document.createElement("p");
    more.innerHTML = text;
    note.insertBefore(more, para);
  });

  let currentPage = 1;
  let totalPages = 1;
  document.getElementById("itemsTotal").addEventListener("change", updateData);
  document.getElementById("itemsPerPage").addEventListener("change", updateData);
  document.getElementById("toggleWubi").addEventListener("change", toggleWubiTags);

  function updateData() {
    const totalCount = document.getElementById("itemsTotal").value;
    const itemsPerPage = parseInt(document.getElementById("itemsPerPage").value);
    var totalCharCount = 0;
    var resultData = Array.from(topData);
    if (/^\d+$/.test(totalCount)) {
      totalCharCount = Math.min(topData.length, parseInt(totalCount));
    } else {
      resultData = Array.from(data.chars[totalCount]);
      totalCharCount = resultData.length;
    }

    totalPages = Math.ceil(totalCharCount / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    // const endIndex = Math.min(startIndex + itemsPerPage, totalCharCount);
    const inputChars = resultData.slice(startIndex, startIndex + itemsPerPage);

    const warningDiv = document.getElementById("note-warning");
    warningDiv.innerText = `🗃️ 共${totalCharCount}个汉字`;

    updateListTableRows(startIndex, inputChars, charData, configData, basedir);
    updatePagination();
  }

  function updatePagination(showCount = 4) {
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";

    const createPageLink = (page, name = null) => {
      const link = document.createElement("a");
      link.textContent = name ? name : page;
      link.href = `?page=${page}`;
      link.onclick = (e) => {
        e.preventDefault();
        currentPage = page;
        updateData();
      };
      return link;
    };

    // previous page
    if (currentPage > 1) {
      const divPrev = document.createElement("span");
      divPrev.className = "prev";
      divPrev.appendChild(createPageLink(currentPage - 1, "<前页"));
      paginationDiv.appendChild(divPrev);
    }

    const divPages = document.createElement("span");
    divPages.className = "pages";
    // first page
    if (currentPage - showCount > 1) {
      const breakSpan = document.createElement("span");
      breakSpan.className = "break";
      breakSpan.textContent = "…";
      divPages.appendChild(createPageLink(1, "首页"));
      divPages.appendChild(breakSpan);
    }

    for (
      let page = Math.max(1, currentPage - showCount);
      page <= Math.min(totalPages, currentPage + showCount);
      page++
    ) {
      if (page === currentPage) {
        const thisPageSpan = document.createElement("span");
        thisPageSpan.className = "current";
        thisPageSpan.textContent = page;
        divPages.appendChild(thisPageSpan); // not link in current page
      } else {
        divPages.appendChild(createPageLink(page));
      }
    }

    // last page
    if (currentPage < totalPages - showCount) {
      const breakSpan = document.createElement("span");
      breakSpan.className = "break";
      breakSpan.textContent = "…";
      divPages.appendChild(breakSpan);
      divPages.appendChild(createPageLink(totalPages, "末页"));
    }
    paginationDiv.appendChild(divPages);

    // next page
    if (currentPage < totalPages) {
      const divNext = document.createElement("span");
      divNext.className = "next";
      divNext.appendChild(createPageLink(currentPage + 1, "后页>"));
      paginationDiv.appendChild(divNext);
    }
  }

  initListTable();
  updateData();
});
