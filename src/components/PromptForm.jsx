import React, { useState } from 'react';

const PromptForm = ({ onPromptAdded, userId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [prompt, setPrompt] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !prompt) return;

        setLoading(true);
        try {
            const { supabase } = await import('../lib/supabaseClient');
            const { data, error } = await supabase
                .from('prompts')
                .insert([
                    { 
                        title, 
                        description, 
                        prompt, 
                        category,
                        user_id: userId 
                    }
                ])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                onPromptAdded(data[0]);
                setTitle('');
                setDescription('');
                setPrompt('');
                setCategory('');
            }
        } catch (error) {
            console.error('Error adding prompt:', error);
            alert('Ошибка при добавлении промта. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prompt-form">
            <h2>Добавить новый промт</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Название *</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Например: Генерация логотипа"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание</label>
                    <textarea
                        id="description"
                        placeholder="Краткое описание того, что делает этот промт"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="2"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="prompt">Промт *</label>
                    <textarea
                        id="prompt"
                        placeholder="Введите ваш промт для нейросети"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows="5"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Категория</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Выберите категорию</option>
                        <option value="art">Искусство</option>
                        <option value="text">Текст</option>
                        <option value="code">Код</option>
                        <option value="business">Бизнес</option>
                        <option value="education">Образование</option>
                        <option value="other">Другое</option>
                    </select>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Добавление...' : 'Опубликовать промт'}
                </button>
            </form>
        </div>
    );
};

export default PromptForm;
