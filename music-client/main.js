"use strict";

const SERVER_ROOT = 'http://localhost:3000';
let actualState = 0;  //0 for none,1 repeat one, 2 for repeat All, 3 for Shuffle
window.onload = function () {

    if (localStorage.getItem('accessToken')) {
        afterLogin();
    } else {
        notLogin();
    }


    document.getElementById('loginBtn').onclick = function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;


        fetch(`${SERVER_ROOT}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                username,
                password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(data => loggedInFeatures(data));
    }

    document.getElementById('logoutBtn').onclick = function () {
        localStorage.removeItem('accessToken');
        notLogin();
        // document.getElementById('content').innerHTML = 'Welcome to MIU Station';
    }
}

function searchSong() {
    let txt = document.getElementById("search-input").value;
    //console.log("txt is", txt.toUpperCase());

    fetch(`${SERVER_ROOT}/api/music?search=${txt}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    }).then(response => response.json())
        .then(data => {
            console.log(data)
            createSongsList(data)
        });

}

function loggedInFeatures(data) {
    if (data.status) {
        document.getElementById('errormessage').innerHTML = data.message;
    } else {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        localStorage.setItem('accessToken', data.accessToken);
        afterLogin();
    }
}

function fetchMusic() {


    fetch(`${SERVER_ROOT}/api/music`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
        .then(response => response.json())
        .then(songs => createSongsList(songs));

}

function createSongsList(songs) {

    let tbody = document.getElementById("tbodyAll");
    tbody.innerHTML = '';

    for (let i = 0; i < songs.length; i++) {
        let element = `<tr>
    <th scope="row">${i + 1}</th>
    <td>${songs[i].title}</td>
    <td>${songs[i].releaseDate}</td>
    <td>
    <i data-music="${songs[i].id}" onclick="addToPlaylist(this)" style="color: red; margin-left:10%;" class="fa-solid fa-circle-plus"></i>
    </td>
  </tr>`
        tbody.innerHTML += element;
    }

}

function fetchPlayList() {

    fetch(`${SERVER_ROOT}/api/playlist`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
        .then(response => response.json())
        .then(songs => createPlaylist(songs));
}

function createPlaylist(songs) {
    let tbody = document.getElementById("tbodyPlaylist");
    tbody.innerHTML = '';
    for (let elem of songs) {
        // songsArr.push(songs[i].urlPath);

        // localStorage.setItem(`song${i}`, songs[i].title)
        // console.log(sessionStorage.getItem("song1"))
        let element = `<tr>
    <th scope="row">${elem.orderId}</th>
    <td>${elem.title}</td>
    <td><i data-music="${elem.songId}" onclick="removeItem(this)" style="color: red; margin-left:10%;" class="fa-solid fa-trash"></i>
    <i data-play="${elem.orderId}" onclick="findSongToPlay(${elem.orderId})" style="color: red; margin-left:10%;" class="fa-solid fa-circle-play"></i>
    </td>
  </tr>`
        tbody.innerHTML += element;
    }

}

function addToPlaylist(obj) {
    //console.log("my obj ",obj);
    let songId = obj.getAttribute("data-music");
    fetch(`${SERVER_ROOT}/api/playlist/add`, {
        method: 'POST',
        body: JSON.stringify({
            songId
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    fetchPlayList();
}

function removeItem(obj) {
    let songId = obj.getAttribute("data-music");
    fetch(`${SERVER_ROOT}/api/playlist/remove`, {
        method: 'POST',
        body: JSON.stringify({
            songId
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    fetchPlayList();
}


function findSongToPlay(order) {
    //console.log("is is ",order)
    //let order= obj.getAttribute("data-play")
    fetch(`${SERVER_ROOT}/api/playlist`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
        .then(response => response.json())
        .then(songs => {
            let songToPlay = songs.filter(elem => {
                //console.log(elem.orderId+ " vs "+ order);
                return elem.orderId == order;
            })
            //console.log("Song to play ",songToPlay)

            if(actualState==1){
                console.log("case 1", songToPlay[0].orderId)
                repeatOne(songToPlay[0].title, songToPlay[0].urlPath, songToPlay[0].orderId);
            }

            else if(actualState==2) {
                console.log("case 2",  songToPlay[0].orderId)
                repeatAll(songToPlay[0].title, songToPlay[0].urlPath, songToPlay[0].orderId, songs.length);
              }

            else if(actualState==3){
                    shuffle(songToPlay[0].title, songToPlay[0].urlPath, songToPlay[0].orderId, songs.length);
                    console.log("case 3",  songToPlay[0].orderId)
                }
            else{
                console.log("case else 0",  songToPlay[0].orderId)
                playing(songToPlay[0].title, songToPlay[0].urlPath, songToPlay[0].orderId);}
            
        });

}

function playing(title, path, order) {
    // console.log("my obj is ", order)
    //let songId = obj.getAttribute("data-play");
    if (actualState === 0) {
        document.getElementById('paragraph').innerHTML = order+". "+title;
        let form = document.getElementById('audioForm');
        form.innerHTML = `<button onclick="findSongToPlay(${order - 1})"><i class="fa-solid fa-backward"></i></button>
   <audio onended="findSongToPlay(${order + 1})" controls autoplay>
   <source src="${SERVER_ROOT}/${path}" type="audio/mpeg">
</audio> 
<button onclick="findSongToPlay(${order + 1})"><i class="fa-solid fa-forward"></i></button> 
<button onclick="shuffleOrRepeat(${order})">OFF</button>`;
    }
}


function shuffleOrRepeat(order){
    actualState++;
    if(actualState==4)
        actualState=0;
    findSongToPlay(order);
}


function shuffle(title, path, oldID, length) {
    let nextID = Math.floor(Math.random() * (length + 1));
    //console.log("order is ", nextID)
    if (nextID > 0 && nextID != oldID)   //to avoid having 0 as orderID 
    {
        document.getElementById('paragraph').innerHTML = oldID+". "+title;
        let form = document.getElementById('audioForm');
        form.innerHTML = `<button onclick="findSongToPlay(${nextID})"><i class="fa-solid fa-backward"></i></button>
        <audio onended="shuffle('${title}','${path}',${nextID},${length})" controls autoplay>
        <source src="${SERVER_ROOT}/${path}" type="audio/mpeg">
     </audio> 
     <button onclick="findSongToPlay(${nextID})"><i class="fa-solid fa-forward"></i></button> 
     <button onclick="shuffleOrRepeat(${oldID})"><i class="fa-solid fa-shuffle"></i></button>`
    }
    else{
        shuffle(title,path,oldID,length);
        console.log('Shuffle again');
    }
}




function repeatOne(title, path, order) {
    document.getElementById('paragraph').innerHTML = order+". "+title;
    let form = document.getElementById('audioForm');
    form.innerHTML = `<button onclick="findSongToPlay(${order})"><i class="fa-solid fa-backward"></i></button>
   <audio onended="repeatOne('${title}','${path}',${order})" controls autoplay>
   <source src="${SERVER_ROOT}/${path}" type="audio/mpeg">
</audio> 
<button onclick="findSongToPlay(${order})"><i class="fa-solid fa-forward"></i></button> 
<button onclick="shuffleOrRepeat(${order})"><i class="fa-solid fa-arrow-rotate-right"></i></button>`
}




function repeatAll(title, path, order, length) {
    if (length == order) {
        document.getElementById('paragraph').innerHTML = order+". "+title;
        let form = document.getElementById('audioForm');
        form.innerHTML = `<button onclick="findSongToPlay(${order - 1})"><i class="fa-solid fa-backward"></i></button>
   <audio onended="repeatAll('${title}','${path}',${order},${length})" controls autoplay>
   <source src="${SERVER_ROOT}/${path}" type="audio/mpeg">
</audio> 
<button onclick="findSongToPlay(1)"><i class="fa-solid fa-forward"></i></button> 
<button  onclick="shuffleOrRepeat(${order})"><i class="fa-solid fa-arrows-rotate"></i></button>`
    }
    else{
    document.getElementById('paragraph').innerHTML = order+". "+title;
    let form = document.getElementById('audioForm');
    form.innerHTML = `<button onclick="findSongToPlay(${order - 1})"><i class="fa-solid fa-backward"></i></button>
   <audio onended="repeatAll('${title}','${path}',${order+1},${length})" controls autoplay>
   <source src="${SERVER_ROOT}/${path}" type="audio/mpeg">
</audio> 
<button onclick="findSongToPlay(${order + 1})"><i class="fa-solid fa-forward"></i></button> 
<button  onclick="shuffleOrRepeat(${order})"><i class="fa-solid fa-arrows-rotate"></i></button>`;
    }

    
}




function afterLogin() {
    document.getElementById('search').style.display = 'block';
    document.getElementById('logout-div').style.display = 'block';
    document.getElementById('login-div').style.display = 'none';
    document.getElementById('content').style.display = 'inline-flex';
    document.getElementById('welcomePage').style.display = "none";
    fetchMusic();
    fetchPlayList();
}

function notLogin() {
    document.getElementById('search').style.display = 'none';
    document.getElementById('logout-div').style.display = 'none';
    document.getElementById('content').style.display = 'none';
    document.getElementById('login-div').style.display = 'block';
    document.getElementById('welcomePage').style.display = "flex";
}