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
