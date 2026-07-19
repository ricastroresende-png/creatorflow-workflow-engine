import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  LayoutGrid,
  List,
  Loader2,
  Copy,
  Check,
  Search,
  Zap,
  Sparkles,
  Edit3,
  CheckCircle2,
  Circle,
  X,
  Tag as TagIcon,
} from 'lucide-react';
import { Thought, ViewMode } from '../types';
import { gemini } from '../services/geminiService';
import { storage } from '../services/storageService';

const BrainDump: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados para Edição Inline
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState('');
  const [inlineEditTags, setInlineEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const load = useCallback(async () => {
    const data = await storage.getThoughts();
    setThoughts(data || []);
    setIsInitialLoading(false);
  }, []);

  useEffect(() => {
    load();
    const handleDataChange = () => load();
    window.addEventListener('supabase-data-change', handleDataChange);
    const savedMode = localStorage.getItem('neurosync_view_mode') as ViewMode;
    if (savedMode) setViewMode(savedMode);
    return () => window.removeEventListener('supabase-data-change', handleDataChange);
  }, [load]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const triggerFeedback = (message: string) => {
    setSuccessAction(message);
    setTimeout(() => setSuccessAction(null), 2500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    triggerFeedback('Copiado para o Clipboard');
  };

  const handleAddThought = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSyncing) return;

    setIsSyncing(true);
    try {
      const title = await gemini.generateTitle(trimmedInput);
      const newThought: Thought = {
        id: crypto.randomUUID(),
        content: trimmedInput,
        category: title,
        timestamp: Date.now(),
        tags: ['Draft'],
        status: 'pending',
      };

      await storage.saveThought(newThought);
      setThoughts((prev) => [newThought, ...prev]);
      setInputValue('');
      triggerFeedback('Nó Sincronizado');
    } catch (error) {
      console.error('Erro na extração:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleComplete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = thoughts.find((t) => t.id === id);
    if (!item) return;

    const updated = { ...item, status: (item.status === 'completed' ? 'pending' : 'completed') as any };
    setThoughts((prev) => prev.map((t) => (t.id === id ? updated : t)));

    try {
      await storage.saveThought(updated);
      triggerFeedback('Status Atualizado');
    } catch (err) {
      load();
    }
  };

  const startInlineEdit = (thought: Thought) => {
    setInlineEditingId(thought.id);
    setInlineEditValue(thought.content);
    setInlineEditTags(thought.tags || []);
    setNewTagInput('');
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const tag = newTagInput.trim();
      if (!inlineEditTags.includes(tag)) {
        setInlineEditTags((prev) => [...prev, tag]);
      }
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setInlineEditTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const saveInlineEdit = useCallback(async () => {
    if (!inlineEditingId) return;
    const target = thoughts.find((t) => t.id === inlineEditingId);
    if (!target) return;

    const updated = { ...target, content: inlineEditValue, tags: inlineEditTags };
    setThoughts((prev) => prev.map((t) => (t.id === inlineEditingId ? updated : t)));

    try {
      await storage.saveThought(updated);
      setInlineEditingId(null);
      triggerFeedback('Nó Atualizado');
    } catch (err) {
      load();
    }
  }, [inlineEditingId, inlineEditValue, inlineEditTags, thoughts, load]);

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      saveInlineEdit();
    }
    if (e.key === 'Escape') setInlineEditingId(null);
  };

  const refineThought = async (e: React.MouseEvent, thought: Thought) => {
    e.stopPropagation();
    setRefiningId(thought.id);
    try {
      const refined = await gemini.refineThought(thought.content);
      const currentTags = thought.tags || [];
      const updatedTags = Array.from(new Set([...currentTags, 'Deep Think', 'Refinado']));

      const updatedThought = {
        ...thought,
        content: refined,
        tags: updatedTags,
      };

      setThoughts((prev) => prev.map((t) => (t.id === thought.id ? updatedThought : t)));
      await storage.saveThought(updatedThought);
      triggerFeedback('Insight Refinado & Sincronizado');
    } catch (error) {
      console.error('Erro no processamento lógico:', error);
    } finally {
      setRefiningId(null);
    }
  };

  const deleteThought = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Remover este nó permanentemente?')) return;
    setThoughts((prev) => prev.filter((t) => t.id !== id));
    try {
      await storage.deleteThought(id);
      triggerFeedback('Nó Removido');
    } catch (err) {
      load();
    }
  };

  const filteredThoughts = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    if (!query) return thoughts;
    return thoughts.filter(
      (t) =>
        t.content.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query))),
    );
  }, [thoughts, debouncedSearchQuery]);

  if (isInitialLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em]">Sincronizando Matriz...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Toast Central */}
      {successAction && (
        <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
          <div className="glass px-10 py-5 rounded-[32px] border border-cyan-500/30 text-white font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-4 shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-toast-pop">
            <Zap className="w-5 h-5 fill-cyan-500 text-cyan-500" />
            {successAction}
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tighter leading-none">Matriz Neural</h1>
          <p className="text-gray-500 font-light text-sm">Organização de insights com inteligência profunda.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Localizar nó ou tag..."
              className="w-64 bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-gray-200 outline-none focus:border-white/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 glass p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleAddThought} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-transparent blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative glass p-4 rounded-[32px] border border-white/10 flex items-center gap-4 focus-within:border-white/20 transition-all">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddThought();
                }
              }}
              placeholder="Capturar insight bruto..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-700 resize-none h-12 py-3 px-4 outline-none font-light"
            />
            <button
              type="submit"
              disabled={isSyncing || !inputValue.trim()}
              className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-10"
            >
              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      <div className={`grid gap-6 px-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredThoughts.map((thought) => {
          const isEditing = inlineEditingId === thought.id;
          const isCompleted = thought.status === 'completed';
          const isBeingRefined = refiningId === thought.id;

          return (
            <div
              key={thought.id}
              className={`group glass p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden flex flex-col h-full border-white/5 hover:border-white/10 ${isCompleted ? 'opacity-40 grayscale' : 'opacity-100'} ${isEditing ? 'ring-1 ring-cyan-500/50 bg-cyan-500/[0.04]' : ''}`}
            >
              {isBeingRefined && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[32px]">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold">Refinando...</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleComplete(e, thought.id)}
                    className={`transition-colors ${isCompleted ? 'text-cyan-500' : 'text-gray-700 hover:text-white'}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-cyan-400">{thought.category}</span>
                </div>
              </div>

              <div className="flex-1 space-y-6 relative z-10">
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      autoFocus
                      value={inlineEditValue}
                      onChange={(e) => setInlineEditValue(e.target.value)}
                      onKeyDown={handleInlineKeyDown}
                      className="w-full bg-transparent text-white focus:outline-none transition-all font-light leading-relaxed resize-none h-40 text-sm p-0 border-none ring-0"
                    />

                    {/* Interface de Edição de Tags */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                        <TagIcon className="w-3 h-3" /> Gerenciar Tags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {inlineEditTags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-mono uppercase tracking-widest text-cyan-400"
                          >
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={addTag}
                          placeholder="Adicionar tag..."
                          className="bg-transparent border-none focus:ring-0 text-[10px] text-gray-400 placeholder-gray-700 w-24 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDoubleClick={() => startInlineEdit(thought)}
                    className="text-gray-400 font-light leading-relaxed transition-colors group-hover:text-gray-200 text-sm line-clamp-6"
                  >
                    {thought.content}
                  </div>
                )}

                {!isEditing && thought.tags && thought.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {thought.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-md text-[7px] font-mono uppercase tracking-widest border transition-all ${
                          tag === 'Refinado'
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold'
                            : 'bg-white/5 border-white/10 text-gray-500'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveInlineEdit}
                        className="px-4 py-2 rounded-xl bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setInlineEditingId(null)}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startInlineEdit(thought)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(thought.content, thought.id)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-cyan-400 transition-all"
                      >
                        {copiedId === thought.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => deleteThought(e, thought.id)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={(e) => refineThought(e, thought)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all bg-white text-black hover:scale-105"
                  >
                    <Sparkles className="w-3 h-3" />
                    Refinar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrainDump;
