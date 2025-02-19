function initTable(show) {
  // init table
  const headers = ["序号", "汉字", "基本信息", "五笔全码", "简码/容错码", "五笔字根拆解"];
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

function createTableRow(index, char, charInfo, configData, imgPath, svgData, available) {
  const row = document.createElement("tr");

  const indexCell = document.createElement("td");
  const charCell = document.createElement("td");
  const infoCell = document.createElement("td");
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
    getListData(["简码", "容错"], [charInfo.shortCode, charInfo.faultCode], configData)
  );

  row.appendChild(indexCell);
  row.appendChild(charCell);
  row.appendChild(infoCell);
  row.appendChild(codeCell);
  row.appendChild(extraCell);
  row.appendChild(sliceCell);

  // console.log(imgPath)
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

const queryHanzi = async (charData, configData, basedir, maxCount = 50) => {
  const allChars = charData.all;

  // only top N chars
  const input = document.getElementById("query-text").value.trim();
  const inputChars = input.replace(/[a-zA-Z\d\s]/g, "").slice(0, maxCount);

  const warningDiv = document.getElementById("note-warning");
  warningDiv.innerText = "";

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  const filteredChars = [...inputChars].filter((char) => allChars.includes(char));
  const valid = filteredChars.length;
  if (valid === 0) {
    warningDiv.innerText =
      inputChars.length > 0 ? "🚫 异体或罕用字，请尝试其他。" : "❗ 请输入常用汉字。";
    return;
  }

  warningDiv.innerText = "";
  initTable(valid !== 0);

  renderCharList(filteredChars, 0, false, basedir, charData, configData, tableBody, createTableRow);
};

document.addEventListener("DOMContentLoaded", async () => {
  const maxCount = 50;
  const basedir = ".";
  const datafile = `${basedir}/data/data.json`;

  try {
    // init data
    const response = await fetch(datafile);
    if (!response.ok) {
      throw new Error("Network response error");
    }

    const data = await response.json();
    const statsData = data.stats;
    const charData = data.chars;
    const configData = data.config;

    const paragraphs = [
      "<p>📝 注意这里五笔版本是<strong>1986</strong>版（王码4.5版）五笔（10830版编码〈 <code>⊙</code>标注〉作为兼容码补充）。</p>",
      `<blockquote class="note">
        当前收录汉字共${statsData.total}字（囊括通用规范汉字及其繁体，港台地区和其他常用字）。<br>
      （五笔全码：${statsData.code}，字根拆解：${statsData.units}，图解：${statsData.segments}）
        </blockquote>`,
      `<blockquote class="note">
    ⚠️ 标识表示全码和容错码存在一定争议（比如起笔或末笔笔画顺序）。
    </blockquote>`,
    ];

    const note = document.getElementById("note-area");
    const para = document.getElementById("note-warning");
    para.innerHTML = "";
    paragraphs.forEach((text) => {
      const more = document.createElement("p");
      more.innerHTML = text;
      note.insertBefore(more, para);
    });

    // event
    document.getElementById("query-button").addEventListener("click", () => {
      queryHanzi(charData, configData, basedir, maxCount);
    });
    document.getElementById("query-text").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        queryHanzi(charData, configData, basedir, maxCount);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
