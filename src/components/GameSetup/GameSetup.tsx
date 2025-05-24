import React, { useState } from 'react';
import { GameSetupProps, GameConfig } from '../../types/gameTypes';
import './GameSetup.css';

export const GameSetup: React.FC<GameSetupProps> = ({
    onConfigSubmit,
    defaultConfig = {
        wordCount: 20,
        timeLimit: 120, // 2 minutes default
        numberOfParagraphs: 1,
        storyComplexity: 'medium'
    },
    showStoryOptions = false,
    minWordCount = 5,
    maxWordCount = 100,
    minTimeLimit = 30,
    maxTimeLimit = 600
}) => {
    const [config, setConfig] = useState<GameConfig>(defaultConfig);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfigSubmit(config);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'storyComplexity' ? value : parseInt(value, 10)
        }));
    };

    return (
        <div className="game-setup">
            <h2>Game Settings</h2>
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label htmlFor="wordCount">Number of Words</label>
                    <div className="input-container">
                        <input
                            type="number"
                            id="wordCount"
                            name="wordCount"
                            min={minWordCount}
                            max={maxWordCount}
                            value={config.wordCount}
                            onChange={handleChange}
                        />
                        <span className="hint">Choose between {minWordCount} and {maxWordCount} words</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="timeLimit">Time Limit</label>
                    <div className="input-container">
                        <input
                            type="number"
                            id="timeLimit"
                            name="timeLimit"
                            min={minTimeLimit}
                            max={maxTimeLimit}
                            value={config.timeLimit}
                            onChange={handleChange}
                        />
                        <span className="hint">Set time between {minTimeLimit} and {maxTimeLimit} seconds</span>
                    </div>
                </div>

                {showStoryOptions && (
                    <>
                        <div className="form-group">
                            <label htmlFor="numberOfParagraphs">Number of Paragraphs</label>
                            <div className="input-container">
                                <input
                                    type="number"
                                    id="numberOfParagraphs"
                                    name="numberOfParagraphs"
                                    min={1}
                                    max={10}
                                    value={config.numberOfParagraphs}
                                    onChange={handleChange}
                                />
                                <span className="hint">Number of paragraphs to generate</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="storyComplexity">Story Complexity</label>
                            <div className="input-container">
                                <select
                                    id="storyComplexity"
                                    name="storyComplexity"
                                    value={config.storyComplexity}
                                    onChange={handleChange}
                                    className="select-input"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <span className="hint">Choose the difficulty level of generated content</span>
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="game-button setup-test">
                    <h4>Start Game</h4>
                    <p>Begin practice with selected settings</p>
                </button>
            </form>
        </div>
    );
}; 