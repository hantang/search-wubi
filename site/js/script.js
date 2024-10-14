function renderFanningStrokes(target, strokes, unitData) {
  // refer: https://hanziwriter.org/docs.html#raw-character-svg
  const url = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(url, "svg");
  svg.style.width = "75px";
  svg.style.height = "75px";
  svg.style.border = "1px solid #EEE";
  svg.style.marginRight = "3px";
  target.appendChild(svg);
  var group = document.createElementNS(url, "g");

  // set the transform property on the g element so the character renders at 75x75
  var transformData = HanziWriter.getScalingTransform(75, 75);
  group.setAttributeNS(null, "transform", transformData.transform);
  svg.appendChild(group);

  strokes.forEach((strokePath, index) => {
    var path = document.createElementNS(url, "path");
    path.setAttributeNS(null, "d", strokePath);
    // style the character paths
    path.style.fill = unitData.includes(index) ? "#F00" : "#555";
    group.appendChild(path);
  });
}

function plotWubiSegments(target, charData, segments) {
  // var target = document.createElement("td");
  const unitData = segments;
  if (Array.isArray(unitData) && unitData.length > 0) {
    unitData.forEach((root) => {
      renderFanningStrokes(target, charData.strokes, root);
    });
  } else {
    renderFanningStrokes(target, charData.strokes, []);
  }
  // return target;
}

function getListData(keys, values) {
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
      if (keys[index] == "收录字表") {
        const tip = document.createElement("strong");
        tip.innerText = keys[index] + ":";
        const container = getHanziList(item);
        listItem.append(tip);
        listItem.append(container);
      } else {
        let val = item.trim() ? `&nbsp;&nbsp;<code>${item}</code>` : "";
        if (item.trim() && item.includes("/")) {
          val =
            "<br>" +
            item
              .replace(/^\*/, "")
              .split("/")
              .map((item) => `&nbsp;&nbsp;<code>${item}</code>`)
              .join("<br>");
        }
        if (item.startsWith("*")) {
          val = `&nbsp;⚠️${val}`;
        }
        listItem.innerHTML = `<strong>${keys[index]}</strong>:${val}`;
      }
      itemList.appendChild(listItem);
    });
  }
  return itemList;
}

function getHanziList(sources) {
  const names = {
    一级: "《通用规范汉字表》（2012年）一级汉字",
    二级: "《通用规范汉字表》（2012年）二级汉字",
    三级: "《通用规范汉字表》（2012年）三级汉字",
    GB2312: "《信息交换用汉字编码字符集》（GB/T 2312-1980）",
    常用字: "《现代汉语常用字表》（1988年）常用字",
    次常用字: "《现代汉语常用字表》（1988年）次常用字",
    通用字: "《现代汉语通用字表》（1988年）常用字",
    其他: "其他常用汉字",
  };
  // console.log(sources);
  const values = sources.split("/");
  values.forEach((item) => {
    const name = item.charAt(0);
    names[item];
    const div = document.createElement("div");
  });
  const container = document.createElement("div");
  values.forEach((item) => {
    const tooltipDiv = document.createElement("div");
    tooltipDiv.className = "tooltip";
    tooltipDiv.textContent = item.charAt(0);

    const tooltipText = document.createElement("span");
    tooltipText.className = "tooltiptext";
    tooltipText.textContent = names[item];

    tooltipDiv.appendChild(tooltipText);
    container.appendChild(tooltipDiv);
  });
  return container;
}

function createTableRow(index, data, char) {
  const charInfo = data[char];
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
      ["汉语拼音", "UNICODE", "收录字表"],
      [charInfo.pinyin, charInfo.unicode, charInfo.source]
    )
  );
  codeCell.appendChild(
    getListData(["全码", "拆解"], [charInfo.fullCode, charInfo.units])
  );
  extraCell.appendChild(
    getListData(["简码", "容错"], [charInfo.shortCode, charInfo.faultCode])
  );

  row.appendChild(indexCell);
  row.appendChild(charCell);
  row.appendChild(infoCell);
  row.appendChild(codeCell);
  row.appendChild(extraCell);
  row.appendChild(sliceCell);

  HanziWriter.loadCharacterData(char)
    .then((charData) => {
      plotWubiSegments(sliceCell, charData, charInfo.segments);
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

function queryHanzi() {
  // only top 10 chars
  const input = document.getElementById("query-text").value.trim();
  const chars = input.replace(/[a-zA-Z\d\s]/g, "").slice(0, 10);

  const result = document.getElementById("result");
  result.innerText = "";

  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // clean table

  let valid = 0;
  Array.from(chars).forEach((char, index) => {
    // console.log(char);
    if (char in data) {
      row = createTableRow(index, data, char);
      tableBody.appendChild(row);
      valid += 1;
    }
  });
  initTable(valid !== 0);
  if (valid === 0) {
    if (chars) {
      result.innerText = "非常用汉字，请尝试其他。";
    } else {
      result.innerText = "请输入常用汉字。";
    }
  } else {
    result.innerText = "";
  }
}
