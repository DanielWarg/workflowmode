'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface YjsContextType {
    provider: HocuspocusProvider | null;
    doc: Y.Doc | null;
    status: 'connecting' | 'connected' | 'disconnected';
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const YjsContext = createContext<YjsContextType | undefined>(undefined);

export function YjsProvider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);
    const [status, setStatus] = useState<YjsContextType['status']>('disconnected');
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        // Skapa Yjs dokument
        const yDoc = new Y.Doc();

        // Anslut till Hocuspocus server
        const wsProvider = new HocuspocusProvider({
            url: 'ws://localhost:1234',
            name: 'workflow-v1', // Globalt rum för test
            document: yDoc,
            onConnect: () => setStatus('connected'),
            onDisconnect: () => setStatus('disconnected'),
        });

        // Setup UndoManager
        const um = new Y.UndoManager([
            yDoc.getMap('nodes'),
            yDoc.getMap('edges'),
            yDoc.getArray('lanes'),
            yDoc.getMap('metadata'),
        ]);

        um.on('stack-item-added', () => {
            setCanUndo(um.undoStack.length > 0);
            setCanRedo(um.redoStack.length > 0);
        });

        um.on('stack-item-popped', () => {
            setCanUndo(um.undoStack.length > 0);
            setCanRedo(um.redoStack.length > 0);
        });

        setProvider(wsProvider);
        setDoc(yDoc);
        setUndoManager(um);
        setStatus('connecting');

        // Cleanup
        return () => {
            wsProvider.destroy();
            um.destroy();
        };
    }, []);

    const undo = useCallback(() => {
        undoManager?.undo();
    }, [undoManager]);

    const redo = useCallback(() => {
        undoManager?.redo();
    }, [undoManager]);

    return (
        <YjsContext.Provider value={{ provider, doc, status, undo, redo, canUndo, canRedo }}>
            {children}
        </YjsContext.Provider>
    );
}

export function useYjs() {
    const context = useContext(YjsContext);
    if (!context) {
        throw new Error('useYjs must be used within a YjsProvider');
    }
    return context;
}
