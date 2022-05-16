const SERVER_ROOT = 'http://localhost:3000';
window.onload = function() {

    if (localStorage.getItem('accessToken')) {
        afterLogin();
    } else {
        notLogin();
    }


    document.getElementById('loginBtn').onclick = function() {
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

    document.getElementById('logoutBtn').onclick = function() {
        localStorage.removeItem('accessToken');
        notLogin();
        // document.getElementById('content').innerHTML = 'Welcome to MIU Station';
    }
}

function searchSong(){
    let txt=document.getElementById("search-input").value;
    //console.log("txt is", txt.toUpperCase());

    fetch(`${SERVER_ROOT}/api/music?search=${txt}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    }).then(response => response.json())
    .then(data => {
        console.log(data)
        createSongsList(data)});
    
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

function createSongsList(songs){
    
    let tbody= document.getElementById("tbodyAll");
    tbody.innerHTML='';

    for(let i=0;i<songs.length;i++){
    let element=`<tr>
    <th scope="row">${i+1}</th>
    <td>${songs[i].title}</td>
    <td>${songs[i].releaseDate}</td>
    <td><i data-music="${songs[i].id}" onclick="addToPlaylist(this)" style="color: red; margin-left:10%;" class="fa-solid fa-circle-plus"></i></td>
  </tr>`
    tbody.innerHTML += element;}

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

function createPlaylist(songs){
    console.log("In my f ")
    let tbody= document.getElementById("tbodyPlaylist");
    tbody.innerHTML='';

    for(let i=0;i<songs.length;i++){
        localStorage.setItem(`song${i}`, songs[i].title)
        console.log(sessionStorage.getItem("song1"))
    let element=`<tr>
    <th scope="row">${i+1}</th>
    <td>${songs[i].title}</td>
    <td>${songs[i].urlPath}</td>
    <td><i data-music="${songs[i].songId}" onclick="removeItem(this)" style="color: red; margin-left:10%;" class="fa-solid fa-trash"></i></td>
  </tr>`
    tbody.innerHTML += element;}

}

function addToPlaylist(obj){
//console.log("my obj ",obj);
    let songId = obj.getAttribute("data-music");
    fetch(`${SERVER_ROOT}/api/playlist/add`, {
        method: 'POST',
        body: JSON.stringify({
            songId,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    fetchPlayList();
}

function removeItem(obj){
    let songId = obj.getAttribute("data-music");
    fetch(`${SERVER_ROOT}/api/playlist/remove`, {
        method: 'POST',
        body: JSON.stringify({
            songId,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
    })
    fetchPlayList();
}
function afterLogin() {
    document.getElementById('search').style.display = 'block';
    document.getElementById('logout-div').style.display = 'block';
    document.getElementById('login-div').style.display = 'none';
    document.getElementById('content').style.display='block';
    document.getElementById('welcomePage').style.display = "none";
    fetchMusic();
    fetchPlayList();
}

function notLogin() {
    document.getElementById('search').style.display = 'none';
    document.getElementById('logout-div').style.display = 'none';
    document.getElementById('content').style.display='none';
    document.getElementById('login-div').style.display = 'block';
    document.getElementById('welcomePage').style.display = "flex";
}