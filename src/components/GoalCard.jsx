import React, { useState } from 'react';

const GoalCard = ({ goal, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(goal.title);
    const [editDescription, setEditDescription] = useState(goal.description);
    const [editPriority, setEditPriority] = useState(goal.priority);
    const [editStatus, setEditStatus] = useState(goal.status);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            const { supabase } = await import('../lib/supabaseClient');
            const updatedData = {
                title: editTitle.trim(),
                description: editDescription.trim(),
                priority: editPriority,
                status: editStatus,
            };

            const { data, error: updateError } = await supabase
                .from('goals')
                .update(updatedData)
                .eq('id', goal.id)
                .select()
                .single();

            if (updateError) throw updateError;

            onUpdate(data);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating goal:', err);
            setError('Failed to update goal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            setLoading(true);
            try {
                await onDelete(goal.id);
            } catch (err) {
                console.error('Error deleting goal:', err);
                setError('Failed to delete goal. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setEditTitle(goal.title);
        setEditDescription(goal.description);
        setEditPriority(goal.priority);
        setEditStatus(goal.status);
        setIsEditing(false);
        setError(null);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: '#3b82f6',
            completed: '#10b981',
            paused: '#6b7280',
        };
        return (
            <span 
                className="status-badge"
                style={{ backgroundColor: colors[status] || colors.active }}
            >
                {status}
            </span>
        );
    };

    if (isEditing) {
        return (
            <div className="goal-card editing">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                            disabled={loading}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            disabled={loading}
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>
                </div>
                <div className="card-actions">
                    <button 
                        onClick={handleSave} 
                        className="save-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                        onClick={handleCancel} 
                        className="cancel-btn"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="goal-card">
            <div className="goal-header">
                <h3>{goal.title}</h3>
                {getStatusBadge(goal.status)}
            </div>
            {goal.description && (
                <p className="goal-description">{goal.description}</p>
            )}
            <div className="goal-meta">
                <span 
                    className="priority-badge"
                    style={{ color: getPriorityColor(goal.priority) }}
                >
                    Priority: {goal.priority}
                </span>
                {goal.created_at && (
                    <span className="created-date">
                        Created: {new Date(goal.created_at).toLocaleDateString()}
                    </span>
                )}
            </div>
            <div className="card-actions">
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="edit-btn"
                    disabled={loading}
                >
                    Edit
                </button>
                <button 
                    onClick={handleDelete} 
                    className="delete-btn"
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

export default GoalCard;
