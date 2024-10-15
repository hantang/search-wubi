document.addEventListener("DOMContentLoaded", () => {
  const dataFile = "data/data.json";

  // init data
  fetch(dataFile)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response error");
      }
      return response.json();
    })
    .then((data) => {
      const charData = data.chars;
      const statsData = data.stats;

      const paragraphs = [
        "<p>📝 注意这里五笔版本是<strong>1986</strong>版（王码）五笔。</p>",
        `<p class="note">当前收录汉字: ${statsData.total}字（五笔全码: ${statsData.fullCode}, 字根拆解：${statsData.units}，图解：${statsData.segments}）。</p>`,
        '<p class="note">⚠️ 标识表示全码和容错码存在一定争议（比如起笔或末笔笔画顺序）。</p>',
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
          queryHanzi(charData, statsData);
        });
      document
        .getElementById("query-text")
        .addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            queryHanzi(charData, statsData);
          }
        });
    })
    .catch((error) => {
      console.error("Read JSON error:", error);
    });
});
