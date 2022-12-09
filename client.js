// client.js
const WebSocket= require("ws");
const { waitForWebSocketState } = require("./index");

/**
 * Creates a socket client that connects to the specified `port`. If `closeAfter`
 * is specified, the client automatically closes the socket after it receives
 * the specified number of messages.
 * @param {number} port The port to connect to on the localhost
 * @param {number} [closeAfter] The number of messages to receive before closing the socket
 * @returns {Promise<[WebSocket, Data]>} Tuple containing the created client and any messages it receives
 */
async function createWebSocketClient(port, closeAfter) {
    const client = new WebSocket(`ws://localhost:${port}`);
    await waitForWebSocketState(client, client.OPEN);
    const messages = [];

    client.on("message", (data) => {
        messages.push(data.toString());
        if (messages.length === closeAfter) {
            client.close();
        }
    });

    return new Promise((resolve) => {
        resolve([client, messages]);
    });
}

module.exports = { createWebSocketClient };