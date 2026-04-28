import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import PromptForm from '../components/PromptForm';
import PromptCard from '../components/PromptCard';
import SearchFilter from '../components/SearchFilter';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
    const [prompts, setPrompts] = useState([]);
    const [filteredPrompts, setFilteredPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showMyPromptsOnly, setShowMyPromptsOnly] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    useEffect(() => {
        filterPrompts();
    }, [prompts, searchTerm, categoryFilter, showMyPromptsOnly]);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('prompts')
                .select('*')
                .order('created_at', { ascending: false });

            const { data, error } = await query;
            
            if (error) throw error;
            setPrompts(data || []);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPrompts = () => {
        let filtered = prompts;
        
        if (showMyPromptsOnly) {
            filtered = filtered.filter(prompt => prompt.user_id === user.id);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(prompt => 
                prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(prompt => prompt.category === categoryFilter);
        }
        
        setFilteredPrompts(filtered);
    };

    const handleAddPrompt = (newPrompt) => {
        setPrompts([newPrompt, ...prompts]);
    };

    const handleDeletePrompt = async (promptId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот промт?')) return;
        
        try {
            const { error } = await supabase.from('prompts').delete().eq('id', promptId);
            if (error) throw error;
            setPrompts(prompts.filter(prompt => prompt.id !== promptId));
        } catch (error) {
            console.error('Error deleting prompt:', error);
            alert('Ошибка при удалении промта');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>🚀 ПромтМаркетплейс</h1>
                    <p className="user-info">Привет, {user.email}</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">Выйти</button>
            </header>
            
            <main className="dashboard-main">
                <PromptForm onPromptAdded={handleAddPrompt} userId={user.id} />
                
                <SearchFilter 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    showMyPromptsOnly={showMyPromptsOnly}
                    onShowMyPromptsChange={setShowMyPromptsOnly}
                />
                
                <div className="prompts-container">
                    <h2>
                        {showMyPromptsOnly ? 'Мои промты' : 'Все промты'} 
                        ({filteredPrompts.length})
                    </h2>
                    
                    {loading ? (
                        <p className="loading">Загрузка промтов...</p>
                    ) : filteredPrompts.length === 0 ? (
                        <p className="no-prompts">
                            {showMyPromptsOnly 
                                ? 'У вас пока нет промтов. Создайте первый!' 
                                : 'Промты не найдены.'}
                        </p>
                    ) : (
                        <div className="prompts-grid">
                            {filteredPrompts.map(prompt => (
                                <PromptCard 
                                    key={prompt.id} 
                                    prompt={prompt} 
                                    onDelete={prompt.user_id === user.id ? handleDeletePrompt : null}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;