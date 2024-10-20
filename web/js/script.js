function renderFanningStrokes(target, strokes, unitData, plot) {
  // refer: https://hanziwriter.org/docs.html#raw-character-svg
  const url = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(url, "svg");
  // svg.style.width = "75px";
  // svg.style.height = "75px";
  // svg.style.border = "1px solid #EEE";
  // svg.style.marginRight = "3px";
  target.appendChild(svg);
  var group = document.createElementNS(url, "g");

  // set the transform property on the g element so the character renders at 75x75
  var transformData = HanziWriter.getScalingTransform(75, 75);
  group.setAttributeNS(null, "transform", transformData.transform);
  svg.appendChild(group);
  if (!plot) return;
  strokes.forEach((strokePath, index) => {
    var path = document.createElementNS(url, "path");
    path.setAttributeNS(null, "d", strokePath);
    // style the character paths
    path.style.fill = unitData.includes(index) ? "#F00" : "#555";
    group.appendChild(path);
  });
}

function plotWubiSegments(target, charData, segments, char, flag) {
  // var target = document.createElement("td");
  const unitData = segments;
  const unitCount = Array.isArray(unitData) ? unitData.length : 0;
  if (unitCount > 0) {
    unitData.forEach((root) => {
      renderFanningStrokes(target, charData.strokes, root, true);
    });
  }
  if (unitCount == 0 && flag) {
    const img = document.createElement("img")
    img.src = `assets/${char}.gif`
    img.alt = char;
    target.appendChild(img);
  } else {
    for (let i = unitCount; i < 4; i += 1) {
      renderFanningStrokes(target, charData.strokes, [], i === 0);
    }
  }
}

function getListData(keys, values, charNames) {
  const itemList = document.createElement("ul");
  if (keys === null) {
    let arr = values;
    let useCode = false;
    if (typeof values === "string") {
      arr = values.replace(/^\*/, "").split("/");
      useCode = true;
    }
    arr.forEach((item) => {
      if (item.trim()) {
        const listItem = document.createElement("li");
        listItem.innerHTML = useCode ? `<code>${item}</code>` : item;
        itemList.appendChild(listItem);
      }
    });
  } else {
    values.forEach((item, index) => {
      const listItem = document.createElement("li");
      if (keys[index] == "字表") {
        const tip = document.createElement("strong");
        tip.innerText = keys[index] + ":";
        const container = getHanziList(item, charNames);
        listItem.append(tip);
        listItem.append(container);
      } else {
        let val = "";
        if (item.trim() && item.includes("/")) {
          val =
            "<br>" +
            item
              .replace(/^\*/, "")
              .split("/")
              .map((item) => `&nbsp;&nbsp;<code>${item}</code>`)
              .join("<br>");
        } else {
          const ignores = ["笔画", "拼音", "UNICODE", "备注",];
          val = item.replace(/;(.+)/, "<span>$1</span>");
          if (ignores.includes(keys[index])) {
            val = `&nbsp;&nbsp;${val}`;
          } else {
            val = `&nbsp;&nbsp;<code>${val}</code>`;
          }
        }
        if (item.startsWith("*")) {
          val = `&nbsp;⚠️${val}`;
        }
        if (val) {
          listItem.innerHTML = `<strong>${keys[index]}</strong>:${val}`;
        }
      }
      if (typeof value === "string" && item.trim() || item.length > 0) {
        itemList.appendChild(listItem);
      }
    });
  }
  return itemList;
}

function getHanziList(sources, charNames) {
  // console.log(sources);
  const charGroups = charNames.groups;
  const charLevels = charNames.levels;
  const container = document.createElement("div");
  sources.forEach((item, index) => {
    if (item === "")
      return
    const tooltipDiv = document.createElement("div");
    tooltipDiv.className = "tooltip";
    tooltipDiv.textContent = index == 0 ? charGroups[item][0] : item.substr(0, 2);
    const tooltipText = document.createElement("span");
    tooltipText.className = "tooltiptext";
    tooltipText.textContent = index == 0 ? charGroups[item][1] : charLevels[item];
    tooltipDiv.appendChild(tooltipText);
    container.appendChild(tooltipDiv);
  });
  return container;
}

function createTableRow(index, char, charInfo, flag, charNames) {
  const row = document.createElement("tr");

  const indexCell = document.createElement("td");
  const charCell = document.createElement("td");
  const infoCell = document.createElement("td");
  const codeCell = document.createElement("td");
  const extraCell = document.createElement("td");
  const sliceCell = document.createElement("td");
  // "分级" charInfo.groups
  indexCell.textContent = index + 1;
  charCell.innerHTML = `<span>${char}</span>`;
  infoCell.appendChild(
    getListData(
      ["UNICODE", "IDS", "拼音", "笔画", "部首", "字表"],
      [charInfo.unicode, charInfo.ids, charInfo.pinyin, charInfo.strokes, charInfo.radical, charInfo.groups],
      charNames
    )
  );
  codeCell.appendChild(
    getListData(
      ["全码", "拆解", "识别", "备注"],
      [charInfo.code, charInfo.units, charInfo.flag, charInfo.unitType],
      charNames
    )
  );
  extraCell.appendChild(
    getListData(["简码", "容错"], [charInfo.shortCode, charInfo.faultCode], charNames)
  );

  row.appendChild(indexCell);
  row.appendChild(charCell);
  row.appendChild(infoCell);
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

function queryHanzi(charData, statsData, validData) {
  // only top 10 chars
  const max_count = 50;
  const charNames = statsData;
  const input = document.getElementById("query-text").value.trim();
  const chars = input.replace(/[a-zA-Z\d\s]/g, "").slice(0, max_count);

  const warning = document.getElementById("note-warning");
  warning.innerText = "";

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  let valid = 0;
  Array.from(chars).forEach((char, index) => {
    // console.log(char);
    if (char in charData) {
      const flag = validData["wb98com"]["keep"].includes(char)
      row = createTableRow(index, char, charData[char], flag, charNames);
      tableBody.appendChild(row);
      valid += 1;
    }
  });
  initTable(valid !== 0);
  if (valid === 0) {
    if (chars) {
      warning.innerText = "🚫 异体或罕用字，请尝试其他。";
    } else {
      warning.innerText = "❗ 请输入常用汉字。";
    }
  } else {
    warning.innerText = "";
  }
}
