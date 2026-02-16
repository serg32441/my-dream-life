import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import GoalForm from '../components/GoalForm';
import GoalCard from '../components/GoalCard';
import SearchFilter from '../components/SearchFilter';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
    const [goals, setGoals] = useState([]);
    const [filteredGoals, setFilteredGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchGoals();
    }, []);

    useEffect(() => {
        filterGoals();
    }, [goals, searchTerm, priorityFilter, statusFilter]);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterGoals = () => {
        let filtered = goals;
        if (searchTerm) {
            filtered = filtered.filter(goal => goal.title.toLowerCase().includes(searchTerm.toLowerCase()) || goal.description.toLowerCase().includes(searchTerm.toLowerCase()) );
        }
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(goal => goal.priority === priorityFilter);
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(goal => goal.status === statusFilter);
        }
        setFilteredGoals(filtered);
    };

    const handleAddGoal = (newGoal) => {
        setGoals([newGoal, ...goals]);
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            await supabase.from('goals').delete().eq('id', goalId);
            setGoals(goals.filter(goal => goal.id !== goalId));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const handleUpdateGoal = (updatedGoal) => {
        setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>My Dream Life</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>
            <main className="dashboard-main">
                <GoalForm onGoalAdded={handleAddGoal} userId={user.id} />
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} priorityFilter={priorityFilter} onPriorityChange={setPriorityFilter} statusFilter={statusFilter} onStatusChange={setStatusFilter} />
                <div className="goals-container">
                    {loading ? (
                        <p>Loading goals...</p>
                    ) : filteredGoals.length === 0 ? (
                        <p>No goals found. Create one to get started!</p>
                    ) : (
                        filteredGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onUpdate={handleUpdateGoal} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;