// index.js

const { createServer } = require("http");
const { createWebSocketServer } = require("./server");

/**
 * Creates and starts a WebSocket server from a simple http server for testing purposes.
 * @param {number} port Port for the server to listen on
 * @returns {Promise<Server>} The created server
 */
function startWebSocketServer(port) {
    const server = createServer();
    createWebSocketServer(server);
    return new Promise((resolve) => {
        server.listen(port, () => {
            resolve(server);
        });
    });
}

/**
 * Forces a process to wait until the socket's `readyState` becomes the specified value.
 * @param {number} socket The socket whose `readyState` is being watched
 * @param {number} state The desired `readyState` for the socket
 */
function waitForWebSocketState(socket, state) {
    return new Promise((resolve) => {
        setTimeout(() => {
            socket.readyState === state ? resolve() : waitForWebSocketState(socket, state).then(resolve);
        }, 5);
    });
}

module.exports = { startWebSocketServer, waitForWebSocketState };