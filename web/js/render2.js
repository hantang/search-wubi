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
      const statsData = data.stats;
      const validData = data.valid;
      const charData = data.chars;
      const topData = data.top;

      let currentPage = 1;
      let totalPages = 1;
      document.getElementById('itemsTotal').addEventListener('change', updateData);
      document.getElementById('itemsPerPage').addEventListener('change', updateData);

      function updateData() {
        const totalCount = parseInt(document.getElementById('itemsTotal').value);
        const itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
        const totalCharCount = Math.min(topData.length, totalCount);
        totalPages = Math.ceil(totalCharCount / itemsPerPage);
        currentPage = Math.min(currentPage, totalPages)
        const startIndex = (currentPage - 1) * itemsPerPage;
        // const endIndex = Math.min(startIndex + itemsPerPage, totalCharCount);

        updateListTableRows(topData.substr(startIndex, itemsPerPage), charData, statsData, validData, startIndex)
        updatePagination();
        toggleWubi();
      }

      function updatePagination(showCount = 4) {
        const paginationDiv = document.getElementById('pagination');
        paginationDiv.innerHTML = '';

        const createPageLink = (page, name = null) => {
          const link = document.createElement('a');
          link.textContent = name ? name : page;
          link.href = `?page=${page}`;
          link.onclick = (e) => {
            e.preventDefault();
            currentPage = page;
            updateData();
          };
          return link;
        };

        // previous page
        if (currentPage > 1) {
          const divPrev = document.createElement("span");
          divPrev.className = "prev"
          divPrev.appendChild(createPageLink(currentPage - 1, '<前页'))
          paginationDiv.appendChild(divPrev);
        }

        const divPages = document.createElement("span");
        divPages.className = "pages";
        // first page
        if (currentPage - showCount > 1) {
          const breakSpan = document.createElement("span");
          breakSpan.className = "break";
          breakSpan.textContent = "…"
          divPages.appendChild(createPageLink(1, '首页'));
          divPages.appendChild(breakSpan);
        }

        for (let page = Math.max(1, currentPage - showCount); page <= Math.min(totalPages, currentPage + showCount); page++) {
          if (page === currentPage) {
            const thisPageSpan = document.createElement("span");
            thisPageSpan.className = "current";
            thisPageSpan.textContent = page;
            divPages.appendChild(thisPageSpan); // not link in current page
          } else {
            divPages.appendChild(createPageLink(page));
          }
        }

        // last page
        if (currentPage < totalPages - showCount) {
          const breakSpan = document.createElement("span");
          breakSpan.className = "break";
          breakSpan.textContent = "…"
          divPages.appendChild(breakSpan);
          divPages.appendChild(createPageLink(totalPages, '末页'));
        }
        paginationDiv.appendChild(divPages);

        // next page
        if (currentPage < totalPages) {
          const divNext = document.createElement("span");
          divNext.className = "next"
          divNext.appendChild(createPageLink(currentPage + 1, '后页>'))
          paginationDiv.appendChild(divNext);
        }
      }

      initListTable();
      updateData();
    })
    .catch((error) => {
      console.error("Read JSON error:", error);
    });
});
