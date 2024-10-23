const fetchCharData = async (filePath) => {
  // const filePath = `data/${char}.json`;
  const response = await fetch(filePath);
  if (!response.ok) throw new Error(`Failed to load ${filePath}`);
  return response.json();
};

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

function plotWubiSegments(target, charData, segments, imgPath) {
  const unitData = segments;
  const unitCount = Array.isArray(unitData) ? unitData.length : 0;
  if (unitCount > 0) {
    unitData.forEach((root) => {
      renderFanningStrokes(target, charData.strokes, root, true);
    });
  }
  if (unitCount == 0 && imgPath) {
    const img = document.createElement("img")
    img.src = imgPath;
    const parts = imgPath.split("/");
    img.alt = parts[parts.length - 1].split('.')[0]; // char
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
