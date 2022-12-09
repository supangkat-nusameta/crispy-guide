// createWebSocketServer.test.js
const { startWebSocketServer, waitForWebSocketState } = require("./index");
const { createWebSocketClient } = require("./client");

const port = 3000;

describe("WebSocket Server", () => {

    let server = null;

    beforeAll(async () => {

        // Start server
        server = await startWebSocketServer(port);

    });

    afterAll(() => {

        // Close server
        server.close();

    });

    test("Sometimes the game client receive message", async () => {
        
        // 1. Create test client
        const [client, messages] = await createWebSocketClient(port, 1);
        const testMessage = { type: "ECHO", value: "This is a test message" };
    
        // 2. Send client message
        client.send(JSON.stringify(testMessage));
    
        // 3. Perform assertions on the response
        await waitForWebSocketState(client, client.CLOSED);
        const [responseMessage] = messages;
        expect(responseMessage).toBe(testMessage.value);

    });

    test("Sometimes the game client receives many messages at a time", async () => {

        // 1. Create test client
        const numberOfMessages = 10
        const [client, messages] = await createWebSocketClient(port, numberOfMessages);
        const testMessage = { type: "ECHO_MANY_TIMES", value: "This is a test message" };
        const expectedMessages = [...Array(numberOfMessages)].map(() => testMessage.value);
    
        // 2. Send client message
        client.send(JSON.stringify(testMessage));
    
        // 3. Perform assertions on the response
        await waitForWebSocketState(client, client.CLOSED);
        expect(messages).toStrictEqual(expectedMessages);
        expect(messages.length).toBe(numberOfMessages);

    });

    test("Sometimes the game client receives some specific message for party they joined", async () => {

        // 1. Create test client
        const [clientOne, messagesOne] = await createWebSocketClient(port);
        const [clientTwo, messagesTwo] = await createWebSocketClient(port, 2);
        const [clientThree, messagesThree] = await createWebSocketClient(port);
        const creationMessage = { type: "CREATE_PARTY", value: "FIRST_PARTY" };
        const testMessage = "This is a test message";
    
        // 2. Setup test clients to send messages and close in the right order
        clientOne.on("message", (data) => {
            if (data.toString() === creationMessage.value) {
                const joinMessage = { type: "JOIN_PARTY", value: data.toString() };
                const groupMessage = {
                    type: "MESSAGE_PARTY",
                    value: { groupName: data.toString(), groupMessage: testMessage },
                };
      
                clientTwo.send(JSON.stringify(joinMessage));
                clientTwo.send(JSON.stringify(groupMessage));
            }
        });

        clientTwo.on("close", () => {
            clientOne.close();
            clientThree.close();
        });
    
        // 3. Send client message
        clientOne.send(JSON.stringify(creationMessage));

        // 4. Perform assertions on the responses
        await waitForWebSocketState(clientOne, clientOne.CLOSED);
        await waitForWebSocketState(clientTwo, clientTwo.CLOSED);
        await waitForWebSocketState(clientThree, clientThree.CLOSED);

        const [partyClientOne, messagesOfClientOne] = messagesOne;
        const [partyClientTwo, messagesOfClientTwo] = messagesTwo;

        // Both clientOne and clientTwo should have joined the same group.
        expect(partyClientOne).toBe(creationMessage.value);
        expect(partyClientTwo).toBe(creationMessage.value);

        // Both clientOne and clientTwo should have received the group message.
        expect(messagesOfClientOne).toBe(testMessage);
        expect(messagesOfClientTwo).toBe(testMessage);

        // clientThree should have received no messages
        expect(messagesThree.length).toBe(0);

    });

});