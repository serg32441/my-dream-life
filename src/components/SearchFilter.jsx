import React from 'react';

const SearchFilter = ({ 
    searchTerm, 
    onSearchChange, 
    priorityFilter, 
    onPriorityChange, 
    statusFilter, 
    onStatusChange 
}) => {
    return (
        <div className="search-filter">
            <div className="filter-group">
                <label htmlFor="search">Search</label>
                <input
                    id="search"
                    type="text"
                    placeholder="Search goals..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="filter-group">
                <label htmlFor="priority-filter">Priority</label>
                <select
                    id="priority-filter"
                    value={priorityFilter}
                    onChange={(e) => onPriorityChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="status-filter">Status</label>
                <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                </select>
            </div>
        </div>
    );
};

export default SearchFilter;
