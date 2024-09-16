<?php
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Trending YouTube Songs</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 20px;
//             text-align: center;
//         }

//         .container {
//             max-width: 800px;
//             margin: 0 auto;
//             text-align: center;
//         }

//         h1 {
//             color: #333;
//         }

//         .song {
//             display: flex;
//             align-items: center;
//             margin: 15px 0;
//             background-color: #fff;
//             padding: 10px;
//             border-radius: 5px;
//             box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//         }

//         .song img {
//             width: 160px;
//             height: 90px;
//             object-fit: cover;
//             border-radius: 5px;
//         }

//         .song-title {
//             margin-left: 20px;
//             font-size: 18px;
//             font-weight: bold;
//             color: #333;
//             text-align: left;
//         }

//         .song-title a {
//             text-decoration: none;
//             color: inherit;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <h1>Trending YouTube Songs</h1>
//         <div id="songs-list"></div>
//     </div>

//     <script>
//         async function fetchSongs() {
//             try {
//                 const response = await fetch('https://www.genyt.net/');
//                 const text = await response.text();

//                 const parser = new DOMParser();
//                 const doc = parser.parseFromString(text, 'text/html');

//                 let songs = [];
//                 const divs = doc.querySelectorAll('div.col-lg-12.col-md-12.gytbox.mb-3');

//                 divs.forEach(div => {
//                     const aTag = div.querySelector('a');
//                     const videoUrl = aTag.getAttribute('href');
//                     const videoId = videoUrl.replace('https://video.genyt.net/', '');
//                     const title = div.querySelector('h5.gytTitle a').innerText.trim();
//                     const thumbnail = div.querySelector('img').getAttribute('src');

//                     songs.push({ videoId, title, thumbnail });
//                 });

//                 const songsList = document.getElementById('songs-list');
//                 songsList.innerHTML = '';

//                 songs.forEach(song => {
//                     const songDiv = document.createElement('div');
//                     songDiv.className = 'song';

//                     songDiv.innerHTML = `
//                         <a href="play.html?videoId=${song.videoId}"><img src="${song.thumbnail}" alt="${song.title}"></a>
//                         <div class="song-title">
//                             <a href="play.html?videoId=${song.videoId}">${song.title}</a>
//                         </div>
//                     `;

//                     songsList.appendChild(songDiv);
//                 });

//             } catch (error) {
//                 console.error('Error fetching songs:', error);
//             }
//         }

//         fetchSongs();
//     </script>
// </body>
// </html>
?>
