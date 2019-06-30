const { ipcMain, ipcRenderer } = require('electron');
const os = require( 'os' );
const networkInterfaces = os.networkInterfaces();

const ip = '0.0.0.0';
const port = 9863;
const http = require('http');

const server = http.createServer( ( req, res ) => {    
    let collection = '';
    let interface = {};

    Object.keys(networkInterfaces).forEach( ( v, k ) => {
        
        networkInterfaces[v].forEach( ( vv, kk) => {
            if ( vv.family == 'IPv4' ) {
                interface[v] = vv.address;
            }
        });

        collection += `
            <div class="row" style="margin-top: 10px;">
                <div class="col s12">
                    <div class="card white z-depth-3">
                        <div class="card-content">
                            <div class="row" style="margin-bottom: 0 !important;">
                                <div class="col s6"> <h5>${v}</h5> </div>
                                <div class="col s6" style="border-left: solid 1px #EEE !important;"> <h5 style="font-weight: 100 !important;">${interface[v]}</h5> </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } );

    res.writeHead( 200, {'Content-Type': 'text/html'});

    res.write(`<html>
        <head>
            <title>YTMDesktop Companion Server</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
            <style>
                html, body {
                    margin: 0;
                    padding: 0;
                    text-align: center;
                    background-image: url('https://ytmdesktop.app/img/bg/1.jpg')
                }
                h5 {
                    margin: 1rem 0 1rem 0 !important;
                }
            </style>
        </head>
        <body>
            <nav>
                <div class="nav-wrapper blue">
                <a href="#" class="brand-logo center">YTMDesktop Companion Server</a>
                </div>
            </nav>

            <div class="container">

                ${collection}

            </div>

        </body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    </html>`);

    res.end();
} );

server.listen(port, ip);
const io = require('socket.io')(server);

io.on('connection', function (socket) {

    let timer = setInterval( function() {
        ipcMain.emit('what-is-song-playing-now');
    }, 1000);

    socket.on('disconnect', () => {
        clearInterval(timer);
        //console.log( Object.keys(io.sockets.sockets).length );
    });
    
    ipcMain.on('song-playing-now-is', function(data) {
        socket.emit('media-now-playing', data);
        //console.log(data);
    });

    socket.on('media-commands', function( cmd ) {
        switch( cmd ) {
            case 'previous-track':
                ipcMain.emit('media-previous-track', true);
                break;

            case 'play-track': 
                ipcMain.emit('media-play-pause', true);
                break;

            case 'pause-track':
                ipcMain.emit('media-play-pause', true);
                break;

            case 'next-track':
                ipcMain.emit('media-next-track', true);
                break;

            case 'thumbs-up-track':
                ipcMain.emit('media-up-vote', true);
                break;

            case 'thumbs-down-track':
                ipcMain.emit('media-down-vote', true);
                break;

            case 'volume-up':
                ipcMain.emit('media-volume-up', true)
                break;

            case 'volume-down':
                ipcMain.emit('media-volume-down', true)
                break;
        }
    } );

});

console.log("Companion Server listening on port " + port);