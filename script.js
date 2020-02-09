const form = document.getElementById("form");
const search = document.getElementById("search");
const result = document.getElementById("result");
const more = document.getElementById("more");

const apiURL = "https://api.lyrics.ovh/";

// Lyrics search
async function searchSongs(term) {
  // fetch(`${apiURL}/suggest/${term}`)
  //   .then(res => res.json())
  //   .then(data => console.log(data));

  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  console.log(data);

  showData(data);
}

function showData(data) {
  result.innerHTML = `
  <ul class="songs">
    ${data.data
      .map(
        song => `
      <li>
      <span><strong>${song.artist.name}</strong> - ${song.title}</span>
      <div>
        <button
          class="btn getLyricsBtn"
          data-artist="${song.artist.name}"
          data-songtitle="${song.title}"
        >
          Get lyrics
        </button>
        <button class="btn" onclick="togglePlay('${song.preview}')">Play</button>
      </div>
      <audio class="player">
        <source src="${song.preview}" type="audio/mpeg">
        Your browser does not support the audio tag.
      </audio>
    </li>
    `
      )
      .join("")}
  </ul>
  `;

  if (data.prev || data.next) {
    more.innerHTML = `
      ${
        data.prev
          ? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>`
          : ""
      }
      ${
        data.next
          ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>`
          : ""
      }
    `;
  } else {
    more.innerHTML = "";
  }
}
let playing = false;
function togglePlay(song) {
  document.querySelectorAll(".player").forEach(audio => audio.pause());
  let selector = `.player source[src="${song}"]`;
  let playThis = document.querySelector(selector);
  if (!playing) {
    playThis.parentElement.play();
    playing = true;
  } else {
    playThis.parentElement.pause();
    playing = false;
  }
}

// prev and nex btn
async function getMoreSongs(url) {
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const data = await res.json();

  showData(data);
}

// Event listeners
form.addEventListener("submit", e => {
  e.preventDefault();

  const searchTerm = search.value.trim();
  if (!searchTerm) {
    alert("Please enter search term");
  } else {
    searchSongs(searchTerm);
  }
});

// get lyrics button
result.addEventListener("click", e => {
  const clickedEl = e.target;

  if (clickedEl.classList.contains("getLyricsBtn")) {
    const artist = clickedEl.getAttribute("data-artist");
    const songTitle = clickedEl.getAttribute("data-songtitle");

    getLyrics(artist, songTitle);
  }
});

async function getLyrics(artist, songTitle) {
  console.log("getLyrics fired");

  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();
  // console.log("lyrics: " + data.lyrics);
  let lyrics;
  if (data.lyrics) {
    console.log("if (data.lyrics) TRUE");
    lyrics = data.lyrics.replace(/\r\n|\r|\n/g, "<br/>");
  } else {
    console.log("if (data.lyrics) FALSE");
    lyrics = "We have no lyrics for this";
  }
  // console.log(lyrics);

  result.innerHTML = `
  <h2><strong>${artist}</strong>${songTitle}</h2>
  <p class="left">${lyrics}</p>
  `;

  more.innerHTML = "";
}
