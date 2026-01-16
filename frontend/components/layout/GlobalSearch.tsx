import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageFile } from '../../types';
import fileService from '../../services/fileService';
import {
    IconSearch,
    IconFolder,
    IconFile,
    IconSpinner,
    IconX
} from '../ui/Icons';


// Simple inline formatter if utility not found or import fails.
const formatSize = (bytes: number) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

interface GlobalSearchProps {
    onFileSelect?: (file: StorageFile) => void;
    className?: string;
    isMobile?: boolean; // If true, expands to full screen or uses simplified layout
    onClose?: () => void; // For mobile close
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onFileSelect, className = '', isMobile = false, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                performSearch(query);
            } else {
                setResults([]);
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async (searchTerm: string) => {
        setLoading(true);
        setError(null);
        try {
            // Pass search param specifically using the object signature we added
            const data = await fileService.getFiles({ search: searchTerm });
            setResults(data);
            setIsOpen(true);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to search files');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (file: StorageFile) => {
        setIsOpen(false);
        setQuery('');

        if (onFileSelect) {
            onFileSelect(file);
        } else {
            // Default navigation logic
            if (file.type === 'folder' || file.isFolder) {
                navigate(`/files/${file.id}`);
            } else {
                // Navigate to where the file is (parent folder) and maybe highlight it?
                // Or specific preview page. For now, go to parent folder or root
                navigate(file.parentId ? `/files/${file.parentId}` : '/files');
            }
        }

        if (onClose) onClose();
    };

    return (
        <div ref={wrapperRef} className={`relative group ${className}`}>
            {/* Search Input Bar */}
            <div
                className={`flex items-center bg-slate-100/50 hover:bg-slate-100 focus-within:bg-white border border-transparent focus-within:border-blue-500/50 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] rounded-xl transition-all duration-200 overflow-hidden ${isMobile ? 'h-12 px-4 shadow-sm bg-white' : 'h-10 px-3 w-full md:w-80 lg:w-96'}`}
            >
                <IconSearch className={`w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors ${loading ? 'opacity-0' : 'opacity-100'}`} />

                {loading && (
                    <div className="absolute left-3 md:left-3 animate-spin">
                        <IconSpinner className="w-4 h-4 text-blue-500" />
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-sm ml-2 md:ml-3 placeholder:text-slate-400 text-slate-700 h-full w-full"
                    placeholder="Search files, folders..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen && e.target.value.trim()) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (query.trim()) setIsOpen(true);
                    }}
                />

                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <IconX className="w-3.5 h-3.5" />
                    </button>
                )}

                <div className="hidden md:flex items-center gap-1 ml-2 pointer-events-none opacity-50">
                    <kbd className="h-5 px-1.5 bg-white rounded border border-slate-200 text-[10px] font-sans text-slate-500 font-medium flex items-center shadow-sm">⌘ K</kbd>
                </div>
            </div>

            {/* Results Dropdown */}
            {isOpen && (query.trim().length > 0) && (
                <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isMobile ? 'fixed top-[60px] left-2 right-2 mt-0 max-h-[calc(100vh-100px)]' : 'w-full max-h-[400px]'}`}>
                    <div className="flex flex-col max-h-[inherit]">

                        {/* Header / Status */}
                        <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {results.length > 0 ? `Found ${results.length} results` : 'Search Results'}
                            </span>
                            {loading && <span className="text-[10px] text-blue-500 font-medium">Searching...</span>}
                        </div>

                        {/* Results List */}
                        <div className="overflow-y-auto p-1.5 custom-scrollbar">
                            {results.length > 0 ? (
                                <div className="space-y-0.5">
                                    {results.map((file) => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleSelect(file)}
                                            className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 group/item transition-all duration-150 border border-transparent hover:border-slate-100"
                                        >
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100 ${file.type === 'folder' || file.isFolder ? 'bg-amber-50' : 'bg-white'}`}>
                                                {file.type === 'folder' || file.isFolder ? (
                                                    <IconFolder className="w-4 h-4 text-amber-500" />
                                                ) : (
                                                    <IconFile className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="text-sm font-medium text-slate-700 truncate group-hover/item:text-blue-600 transition-colors">
                                                        {highlightMatch(file.name, query)}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center text-[10px] text-slate-400 gap-2">
                                                    <span className="uppercase font-semibold tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                        {file.type}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatSize(file.size)}</span>
                                                    {file.uploadedAt && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    {!loading && (
                                        <>
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <IconSearch className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">No results found</p>
                                            <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {results.length > 0 && (
                            <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
                                <p className="text-[10px] text-slate-400">Press <kbd className="font-sans font-bold text-slate-500">Enter</kbd> to open first result</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component to highlight matching text
const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-blue-100 text-blue-700 font-semibold rounded-[1px]">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

export default GlobalSearch;
