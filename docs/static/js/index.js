function initTable(show) {
  // init table
  const headers = [
    "序号",
    "汉字",
    "基本信息",
    "五笔全码",
    "简码/容错码",
    "五笔字根拆解",
  ];
  const tableHead = document.querySelector("#data-table thead");
  tableHead.innerHTML = "";
  if (!show) return;

  const headRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headRow.appendChild(th);
  });
  tableHead.append(headRow);
}

function createTableRow(index, char, charInfo, configData, imgPath) {
  const row = document.createElement("tr");

  const indexCell = document.createElement("td");
  const charCell = document.createElement("td");
  const infoCell = document.createElement("td");
  const codeCell = document.createElement("td");
  const extraCell = document.createElement("td");
  const sliceCell = document.createElement("td");

  indexCell.textContent = index + 1;
  charCell.innerHTML = `<span>${char}</span>`;
  infoCell.appendChild(
    getListData(
      ["UNICODE", "IDS", "拼音", "笔画", "部首", "字表"],
      [
        charInfo.unicode,
        charInfo.ids,
        charInfo.pinyin,
        charInfo.strokes,
        charInfo.radical,
        charInfo.groups,
      ],
      configData
    )
  );
  codeCell.appendChild(
    getListData(
      ["全码", "拆解", "识别", "备注"],
      [charInfo.code, charInfo.units, charInfo.flag, charInfo.unitType],
      configData
    )
  );
  extraCell.appendChild(
    getListData(
      ["简码", "容错"],
      [charInfo.shortCode, charInfo.faultCode],
      configData
    )
  );

  row.appendChild(indexCell);
  row.appendChild(charCell);
  row.appendChild(infoCell);
  row.appendChild(codeCell);
  row.appendChild(extraCell);
  row.appendChild(sliceCell);

  // console.log(imgPath)
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

const queryHanzi = async (charData, configData, basedir, maxCount = 50) => {
  const allChars = charData.all;
  const validChars = charData.wb98com;
  const charsDir = `${basedir}/${configData.path.chars}`;
  const imgDir = `${basedir}/${configData.path.assets}`;

  // only top N chars
  const input = document.getElementById("query-text").value.trim();
  const inputChars = input.replace(/[a-zA-Z\d\s]/g, "").slice(0, maxCount);

  const warningDiv = document.getElementById("note-warning");
  warningDiv.innerText = "";

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  const filteredChars = [...inputChars].filter(char => allChars.includes(char));
  const valid = filteredChars.length;
  if (valid === 0) {
    if (inputChars) {
      warningDiv.innerText = "🚫 异体或罕用字，请尝试其他。";
    } else {
      warningDiv.innerText = "❗ 请输入常用汉字。";
    }
  } else {
    warningDiv.innerText = "";
    initTable(valid !== 0);

    try {
      const charFiles = [...filteredChars].map(char => `${charsDir}/${char}.json`);
      const dataPromises = charFiles.map(fetchCharData);
      const results = await Promise.all(dataPromises);

      results.forEach((charInfo, index) => {
        const char = filteredChars[index];
        const imgPath = validChars.includes(char) ? `${imgDir}/${char}.gif` : "";
        const row = createTableRow(index, char, charInfo, configData, imgPath);
        tableBody.appendChild(row);
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
};

