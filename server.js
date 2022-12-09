// server.js
const { WebSocketServer } = require("ws");

let groupNames = [];

/**
 * Creates a WebSocket server from a Node http server. The server must
 * be started externally.
 * @param {Server} server The http server from which to create the WebSocket server
 */
function createWebSocketServer(server) {
    // todo!
    const wss = new WebSocketServer({ server });
    wss.on("connection", function (ws) {
        ws.on("message", function (message) {
            const data = JSON.parse(message);
            switch (data.type) {
                case "ECHO": {
                    ws.send(data.value);
                    break;
                }
                case "ECHO_MANY_TIMES": {
                    for (let i = 0; i < 10; i++) {
                        ws.send(data.value);
                    }
                    break;
                }
                case "CREATE_PARTY": {
                    const groupName = data.value;
          
                    if (!groupNames.find((gn) => gn === groupName)) {
                        groupNames = [...groupNames, groupName];
                        ws.groupName = groupName;
                        ws.send(groupName);
                    } else {
                        ws.send("PARTY_UNAVAILABLE");
                    }
          
                    break;
                }
                case "JOIN_PARTY": {
                    const groupName = data.value;
          
                    if (!groupNames.find((gn) => gn === groupName)) {
                        ws.send("PARTY_UNAVAILABLE");
                    } else {
                        ws.groupName = groupName;
                        ws.send(groupName);
                    }
          
                    break;
                }
                case "MESSAGE_PARTY": {
                    const { groupName, groupMessage } = data.value;
                    if (ws.groupName !== groupName) break;
          
                    wss.clients.forEach((ws_) => {
                        if (ws_.groupName === groupName) ws_.send(groupMessage);
                    });
          
                    break;
                }
                default: 
                    ws.send(data.value);
                    break;
            }
        });
    });
}

module.exports = { createWebSocketServer };