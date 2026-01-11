import { Server } from '@hocuspocus/server';

const server = new Server({
    port: 1234,
    timeout: 4000,

    async onConnect(data) {
        console.log('Client connected:', data.socketId);
    },

    async onLoadDocument(data) {
        // Här kan vi ladda dokumentet från databasen i framtiden
        // if (data.documentName === 'example') { ... }
        return data.document;
    },

    async onStoreDocument(data) {
        // Här kan vi spara dokumentet till databasen
        // console.log('Storing document:', data.documentName);
    },
});

server.listen().then(() => {
    console.log('🚀 WebSocket server running on port 1234');
});
