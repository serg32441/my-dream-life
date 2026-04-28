import React from 'react';

const PromptCard = ({ prompt, onDelete }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="prompt-card">
            <div className="prompt-header">
                <h3>{prompt.title}</h3>
                {prompt.category && (
                    <span className="category-badge">{prompt.category}</span>
                )}
            </div>
            
            {prompt.description && (
                <p className="prompt-description">{prompt.description}</p>
            )}
            
            <div className="prompt-content">
                <pre>{prompt.prompt}</pre>
            </div>
            
            <div className="prompt-footer">
                <button 
                    onClick={handleCopy} 
                    className="copy-btn"
                >
                    {copied ? 'Скопировано!' : 'Копировать'}
                </button>
                
                {onDelete && (
                    <button 
                        onClick={() => onDelete(prompt.id)} 
                        className="delete-btn"
                    >
                        Удалить
                    </button>
                )}
            </div>
        </div>
    );
};

export default PromptCard;
