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

function createTableRow2(index, char, charInfo, flag, charNames) {
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
    charNames
  );
  wubiDiv.className = "wubiCode";
  codeCell.appendChild(wubiDiv);
  extraCell.appendChild(
    getListData(
      ["拆解", "备注"],
      [charInfo.units, charInfo.unitType],
      charNames
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
      plotWubiSegments(imgDiv, charData, charInfo.segments, char, flag);
      sliceCell.appendChild(imgDiv);
    })
    .catch((error) => {
      console.error("Read JSON data failed:", error);
    });

  return row;
}

function updateListTableRows(chars, charData, charNames, validData, start) {
  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  Array.from(chars).forEach((char, index) => {
    if (char in charData) {
      const flag = validData["wb98com"]["keep"].includes(char);
      row = createTableRow2(start + index, char, charData[char], flag, charNames);
      tableBody.appendChild(row);
    }
  });
}

function toggleWubi() {
  const wubiElements = document.querySelectorAll('.wubiCode');
  const isChecked = document.getElementById('toggleWubi').checked;

  wubiElements.forEach(el => {
    el.style.display = isChecked ? 'none' : 'block'; // checkbox show/hidden
  });
}