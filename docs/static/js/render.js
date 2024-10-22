document.addEventListener("DOMContentLoaded", async () => {
  const maxCount = 50;
  const basedir = "./";
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
        queryHanzi(charData, configData, basedir, maxCount);
      });
    document
      .getElementById("query-text")
      .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          queryHanzi(charData, configData, basedir, maxCount);
        }
      });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
