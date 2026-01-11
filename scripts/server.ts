import { Server } from '@hocuspocus/server';
import { supabase } from './supabase';
import * as Y from 'yjs';

const server = new Server({
    port: 1234,
    timeout: 4000,

    async onConnect(data) {
        console.log('Client connected:', data.socketId);
    },

    async onLoadDocument(data) {
        // Load document from Supabase
        const { data: docData, error } = await supabase
            .from('documents')
            .select('data')
            .eq('name', data.documentName)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error loading document:', error);
        }

        if (docData?.data) {
            // Apply the stored update to the document
            // Supabase returns bytea as hex string or buffer depending on driver?
            // supabase-js usually returns string for bytea if not configured otherwise?
            // Actually it seems it returns a hex string or standard string.
            // Let's assume it handles Buffer inserts correctly, but for reads we might need to parse.
            // Safe bet: applyUpdate works with Uint8Array.

            // NOTE: In the node environment, Supabase might return Buffer or hex. 
            // We'll verify this during testing. For now assuming Buffer compatibility.
            const update = typeof docData.data === 'string'
                ? new Uint8Array(Buffer.from(docData.data, 'hex'))
                : new Uint8Array(docData.data);

            Y.applyUpdate(data.document, update);
        }

        return data.document;
    },

    async onStoreDocument(data) {
        // Save document to Supabase
        const update = Y.encodeStateAsUpdate(data.document);

        const { error } = await supabase
            .from('documents')
            .upsert({
                name: data.documentName,
                data: Buffer.from(update),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'name' });

        if (error) {
            console.error('Error storing document:', error);
        } else {
            // console.log('Saved document:', data.documentName);
        }
    },
});

server.listen().then(() => {
    console.log('🚀 WebSocket server running on port 1234');
});
