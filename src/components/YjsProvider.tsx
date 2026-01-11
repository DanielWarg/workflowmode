import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Awareness } from 'y-protocols/awareness';

interface YjsContextType {
    provider: HocuspocusProvider | null;
    doc: Y.Doc | null;
    status: 'connecting' | 'connected' | 'disconnected';
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    awareness: Awareness | null;
}

const YjsContext = createContext<YjsContextType | undefined>(undefined);

const ADJECTIVES = ['Happy', 'Swift', 'Clever', 'Brave', 'Calm', 'Bright', 'Eager'];
const ANIMALS = ['Fox', 'Eagle', 'Bear', 'Lion', 'Wolf', 'Hawk', 'Owl'];
const COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

function getRandomIdentity() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { name: `${adj} ${animal}`, color };
}

export function YjsProvider({ children }: { children: ReactNode }) {
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
    const [doc, setDoc] = useState<Y.Doc | null>(null);
    const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);
    const [status, setStatus] = useState<YjsContextType['status']>('disconnected');
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [awareness, setAwareness] = useState<Awareness | null>(null);

    useEffect(() => {
        const yDoc = new Y.Doc();

        const wsProvider = new HocuspocusProvider({
            url: 'ws://localhost:1234',
            name: 'workflow-v1',
            document: yDoc,
            onConnect: () => setStatus('connected'),
            onDisconnect: () => setStatus('disconnected'),
        });

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

        // Set random identity
        const { name, color } = getRandomIdentity();
        wsProvider.awareness.setLocalStateField('user', { name, color });

        setProvider(wsProvider);
        setDoc(yDoc);
        setUndoManager(um);
        setAwareness(wsProvider.awareness);
        setStatus('connecting');

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
        <YjsContext.Provider value={{ provider, doc, status, undo, redo, canUndo, canRedo, awareness }}>
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

