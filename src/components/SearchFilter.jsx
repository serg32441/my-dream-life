import React from 'react';

const SearchFilter = ({ 
    searchTerm, 
    onSearchChange, 
    categoryFilter, 
    onCategoryChange,
    showMyPromptsOnly,
    onShowMyPromptsChange
}) => {
    return (
        <div className="search-filter">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Поиск промтов по названию или описанию..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            
            <div className="filter-options">
                <select 
                    value={categoryFilter} 
                    onChange={(e) => onCategoryChange(e.target.value)}
                >
                    <option value="all">Все категории</option>
                    <option value="art">Искусство</option>
                    <option value="text">Текст</option>
                    <option value="code">Код</option>
                    <option value="business">Бизнес</option>
                    <option value="education">Образование</option>
                    <option value="other">Другое</option>
                </select>
                
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showMyPromptsOnly}
                        onChange={(e) => onShowMyPromptsChange(e.target.checked)}
                    />
                    Только мои промты
                </label>
            </div>
        </div>
    );
};

export default SearchFilter;
