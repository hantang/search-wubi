async function fetchCharData(filePath) {
  // const filePath = `data/${char}.json`;
  // console.log("load data file", filePath);
  const response = await fetch(filePath);
  if (!response.ok) throw new Error(`Failed to load ${filePath}`);
  return response.json();
}

function renderFanningStrokes(target, strokes, unitData = [], plot = true) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const width = 75, height = 75;
  const STROKE_COLORS = {
    active: "#F00",  // 高亮笔画颜色
    normal: "#555"   // 普通笔画颜色
  };

  const svg = document.createElementNS(SVG_NS, "svg");
  const group = document.createElementNS(SVG_NS, "g");
  const transformData = HanziWriter.getScalingTransform(width, height);
  group.setAttribute("transform", transformData.transform);
  svg.appendChild(group);
  target.appendChild(svg);

  if (!plot) return;

  const fragment = document.createDocumentFragment();
  strokes.forEach((strokePath, index) => {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", strokePath);
    path.style.fill = unitData.includes(index) ? STROKE_COLORS.active : STROKE_COLORS.normal;
    fragment.appendChild(path);
  });
  group.appendChild(fragment);
}

function renderFontSVG(char, svgPathData) {
  // <svg><path fill="currentColor" style="transform: scale(0.462, 0.462); --darkreader-inline-fill: currentColor;" d=""></path></svg>
  // const svgPathData = fetchCharData(`${svgDir}/${char}.json`).then(data => data.path);
  const url = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(url, "svg");
  svg.setAttribute("width", "92.4");
  svg.setAttribute("height", "110.88");
  // svg.setAttribute('style', 'position:absolute;left:0;top:0;');
  // svg.setAttribute('viewBox', '0 0 100 100');

  const path = document.createElementNS(url, "path");
  path.setAttribute("d", svgPathData);
  path.setAttribute("fill", "currentColor");
  path.style = "transform: scale(0.462, 0.462); --darkreader-inline-fill: currentColor;";
  svg.appendChild(path);
  return svg;
}

function plotWubiSegments(target, charData, segments, imgPath) {
  const unitData = segments;
  const unitCount = Array.isArray(unitData) ? unitData.length : 0;
  if (unitCount > 0) {
    unitData.forEach((root) => {
      renderFanningStrokes(target, charData.strokes, root, true);
    });
  }
  if (unitCount == 0 && imgPath) {
    const img = document.createElement("img");
    img.src = imgPath;
    const parts = imgPath.split("/");
    img.alt = parts[parts.length - 1].split(".")[0]; // char
    target.appendChild(img);
  } else {
    for (let i = unitCount; i < 4; i += 1) {
      renderFanningStrokes(target, charData.strokes, [], i === 0);
    }
  }
}

function getListData(keys, values, config) {
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
        const container = getHanziList(item, config);
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
          const ignores = ["笔画", "拼音", "UNICODE", "备注"];
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
      if ((typeof item === "string" && item.trim()) || item.length > 0) {
        itemList.appendChild(listItem);
      }
    });
  }
  return itemList;
}

function getListData2(value) {
  const itemList = document.createElement("ul");
  const arr = value.replace(/^\*/, "").split("/");
  arr.forEach((item) => {
    if (item.trim()) {
      const listItem = document.createElement("li");
      listItem.innerHTML = item;
      itemList.appendChild(listItem);
    }
  });
  return itemList;
}

function getHanziList(sources, config) {
  // console.log(sources);
  const charGroups = config.groups;
  const charLevels = config.levels;
  const container = document.createElement("div");
  sources.forEach((item, index) => {
    if (item === "") return;
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

function char2hex(char) {
  const length = 2;
  const hex = char.codePointAt(0).toString(16);
  return hex.substr(hex.length - length, length).toLowerCase();
}

function toggleWubiTags() {
  const wubiElements = document.querySelectorAll(".wubiCode");
  const isChecked = document.getElementById("toggleWubi").checked;
  // console.log(isChecked);
  wubiElements.forEach((el) => {
    el.style.visibility = isChecked ? "hidden" : "";
  });
}

async function renderCharList(
  filteredCharList,
  start,
  toggle,
  basedir,
  charData,
  configData,
  tableBody,
  createFunc
) {
  // createFunc 渲染表格数据
  const validChars = charData.wb98com;
  const hanziWriterChars = charData["hanzi-writer"];
  const svgChars = charData.svg;

  const charsDir = `${basedir}/${configData.path.chars}`;
  const imgDir = `${basedir}/${configData.path.assets}`;
  const svgDir = `${basedir}/${configData.path.svgs}`;

  try {
    const filteredSvgChars = filteredCharList.filter((char) => svgChars.includes(char));
    const filteredSvgFiles = filteredSvgChars.map((char) => `${svgDir}/${char}.json`);

    const charFiles = filteredCharList.map(
      (char) => `${charsDir}/${char2hex(char)}/${char}.json`
    );

    const svgDataPromises = filteredSvgFiles.map(fetchCharData);
    const svgResults = await Promise.all(svgDataPromises);
    const svgResultMap = svgResults.reduce((acc, data, index) => {
      acc[filteredSvgChars[index]] = data;
      return acc;
    }, {});

    const dataPromises = charFiles.map(fetchCharData);
    const results = await Promise.all(dataPromises);

    results.forEach((charInfo, index) => {
      const char = filteredCharList[index];
      const imgPath = validChars.includes(char) ? `${imgDir}/${char}.gif` : "";
      const svgData = svgResultMap[char];
      const available = hanziWriterChars.includes(char);
      const index2 = index + start;
      const row = createFunc(index2, char, charInfo, configData, imgPath, svgData, available);
      tableBody.appendChild(row);
    });
    if (toggle) {
      toggleWubiTags();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export { fetchCharData, getListData2, getListData, renderCharList, plotWubiSegments, renderFontSVG, toggleWubiTags };
