function initCodeTable(show) {
  // init table
  const headers = [
    "序号",
    "五笔编码",
    "汉字",
    "词组",
    "更多词组",
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


function createCodeTableRow(index, code, codeResult) {
  const row = document.createElement("tr");

  const indexCell = document.createElement("td");
  const codeCell = document.createElement("td");
  const charCell = document.createElement("td");
  const wordCell = document.createElement("td");
  const extraCell = document.createElement("td");

  indexCell.textContent = index + 1;
  codeCell.innerHTML = `<code>${code}</code>`;
  if (codeResult) {
    charCell.appendChild(getListData2(codeResult.c));
    wordCell.appendChild(getListData2(codeResult.w));
    extraCell.appendChild(getListData2(codeResult.x));
  }

  row.appendChild(indexCell);
  row.appendChild(codeCell);
  row.appendChild(charCell);
  row.appendChild(wordCell);
  row.appendChild(extraCell);
  return row;
}

const queryCode = async (configData, basedir, maxCount) => {
  const codeDir = `${basedir}/${configData.path.codes}`;

  // only top N chars
  const input = document.getElementById("query-text").value.trim();
  const regex = new RegExp('^[a-y]{1,4}$');
  const inputCodes = input.toLowerCase().split(/[ ,;]/).filter(c => regex.test(c)).slice(0, maxCount)

  const warningDiv = document.getElementById("note-warning");
  warningDiv.innerText = "";

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  const filteredCodes = inputCodes;
  const valid = filteredCodes.length;
  if (valid === 0) {
    warningDiv.innerText = "输入1-4位五笔编码，空格或英文逗号、分号分隔多个编码";
    return
  }

  initCodeTable(true);

  const names = filteredCodes.map((code) => (code + code).substr(0, 2));
  const uniqueNames = Array.from(new Set(names));
  const fetchPromises = uniqueNames.map((name) =>
    fetchCharData(`${codeDir}/${name}.json`).then(data => ({ name, data }))
  );

  Promise.all(fetchPromises)
    .then(results => {
      const dataObject = {};
      results.forEach(({ name, data }) => {
        dataObject[name] = data; // 假设 data 是一个对象
      });

      filteredCodes.forEach((code, index) => {
        const name = (code + code).substr(0, 2);
        const result = dataObject[name][code]
        const row = createCodeTableRow(index, code, result);
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
  const maxCount = 10;
  const basedir = "..";
  const datafile = `${basedir}/data/data.json`;

  try {
    // init data
    const response = await fetch(datafile);
    if (!response.ok) {
      throw new Error("Network response error");
    }

    const data = await response.json();
    const configData = data.config;

    const paragraphs = [
      "<p>📝 注意这里五笔版本是<strong>1986</strong>版（王码4.5版）五笔（支持全码、简码查询单个汉字或常见词组）。</p>",
    ];

    const note = document.getElementById('note-area');
    const para = document.getElementById('note-warning');
    para.innerHTML = "";
    paragraphs.forEach(text => {
      const more = document.createElement('p');
      more.innerHTML = text;
      note.insertBefore(more, para);
    });

    // event
    document
      .getElementById("query-button")
      .addEventListener("click", () => {
        queryCode(configData, basedir, maxCount);
      });
    document
      .getElementById("query-text")
      .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          queryCode(configData, basedir, maxCount);
        }
      });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
