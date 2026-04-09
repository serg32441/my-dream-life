import React, { useState } from 'react';

const GoalForm = ({ onGoalAdded, userId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('active');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { supabase } = await import('../lib/supabaseClient');
            const newGoal = {
                user_id: userId,
                title: title.trim(),
                description: description.trim(),
                priority,
                status,
                created_at: new Date().toISOString(),
            };

            const { data, error: insertError } = await supabase
                .from('goals')
                .insert([newGoal])
                .select()
                .single();

            if (insertError) throw insertError;

            onGoalAdded(data);
            setTitle('');
            setDescription('');
            setPriority('medium');
            setStatus('active');
        } catch (err) {
            console.error('Error adding goal:', err);
            setError('Failed to add goal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="goal-form">
            <h2>Create New Goal</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter goal title"
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter goal description"
                    disabled={loading}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        disabled={loading}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                    >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Goal'}
            </button>
        </form>
    );
};

export default GoalForm;
