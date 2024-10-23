function initListTable() {
  // init table
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

function createListTableRow(index, char, charInfo, configData, imgPath) {
  const row = document.createElement("tr");

  const indexCell = document.createElement("td");
  const charCell = document.createElement("td");
  const codeCell = document.createElement("td");
  const extraCell = document.createElement("td");
  const sliceCell = document.createElement("td");

  indexCell.textContent = index + 1;
  charCell.innerHTML = `<span>${char}</span>`;
  const wubiDiv = getListData(
    ["全码", "简码", "容错"],
    [charInfo.code, charInfo.shortCode, charInfo.faultCode],
    configData
  );
  wubiDiv.className = "wubiCode";
  codeCell.appendChild(wubiDiv);
  extraCell.appendChild(
    getListData(
      ["拆解", "备注"],
      [charInfo.units, charInfo.unitType],
      configData
    )
  );

  row.appendChild(indexCell);
  row.appendChild(charCell);
  row.appendChild(codeCell);
  row.appendChild(extraCell);
  row.appendChild(sliceCell);

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

  return row;
}

async function updateListTableRows(start, inputChars, charData, configData, basedir) {
  const validChars = charData.wb98com;
  const charsDir = `${basedir}/${configData.path.chars}`;
  const imgDir = `${basedir}/${configData.path.assets}`;

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  const filteredChars = inputChars;
  try {
    const charFiles = [...filteredChars].map(char => `${charsDir}/${char}.json`);
    const dataPromises = charFiles.map(fetchCharData);
    const results = await Promise.all(dataPromises);

    results.forEach((charInfo, index) => {
      const char = filteredChars[index];
      const imgPath = validChars.includes(char) ? `${imgDir}/${char}.gif` : "";
      const row = createListTableRow(index + start, char, charInfo, configData, imgPath);
      tableBody.appendChild(row);
    });
    toggleWubiTags();

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function toggleWubiTags() {
  const wubiElements = document.querySelectorAll('.wubiCode');
  const isChecked = document.getElementById('toggleWubi').checked;
  console.log(isChecked)
  wubiElements.forEach(el => {
    el.style.visibility = isChecked ? 'hidden' : '';
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const basedir = ".."
  const datafile = `${basedir}/data/data.json`;

  try {
    // init data
    const response = await fetch(datafile);
    if (!response.ok) {
      throw new Error("Network response error");
    }

    const data = await response.json();
    const charData = data.chars;
    const configData = data.config;
    const topData = data.chars.top;

    let currentPage = 1;
    let totalPages = 1;
    document.getElementById('itemsTotal').addEventListener('change', updateData);
    document.getElementById('itemsPerPage').addEventListener('change', updateData);

    function updateData() {
      const totalCount = parseInt(document.getElementById('itemsTotal').value);
      const itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
      const totalCharCount = Math.min(topData.length, totalCount);
      totalPages = Math.ceil(totalCharCount / itemsPerPage);
      currentPage = Math.min(currentPage, totalPages)
      const startIndex = (currentPage - 1) * itemsPerPage;
      // const endIndex = Math.min(startIndex + itemsPerPage, totalCharCount);
      const inputChars = topData.substr(startIndex, itemsPerPage);
      updateListTableRows(startIndex, inputChars, charData, configData, basedir);
      updatePagination();
    }

    function updatePagination(showCount = 4) {
      const paginationDiv = document.getElementById('pagination');
      paginationDiv.innerHTML = '';

      const createPageLink = (page, name = null) => {
        const link = document.createElement('a');
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
        divPrev.className = "prev"
        divPrev.appendChild(createPageLink(currentPage - 1, '<前页'))
        paginationDiv.appendChild(divPrev);
      }

      const divPages = document.createElement("span");
      divPages.className = "pages";
      // first page
      if (currentPage - showCount > 1) {
        const breakSpan = document.createElement("span");
        breakSpan.className = "break";
        breakSpan.textContent = "…"
        divPages.appendChild(createPageLink(1, '首页'));
        divPages.appendChild(breakSpan);
      }

      for (let page = Math.max(1, currentPage - showCount); page <= Math.min(totalPages, currentPage + showCount); page++) {
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
        breakSpan.textContent = "…"
        divPages.appendChild(breakSpan);
        divPages.appendChild(createPageLink(totalPages, '末页'));
      }
      paginationDiv.appendChild(divPages);

      // next page
      if (currentPage < totalPages) {
        const divNext = document.createElement("span");
        divNext.className = "next"
        divNext.appendChild(createPageLink(currentPage + 1, '后页>'))
        paginationDiv.appendChild(divNext);
      }
    }

    initListTable();
    updateData();

  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
