import React from 'react';
import './../index.css';

/**
 * Reusable wrapper component for the new split-screen mosaic login layout.
 * Left panel: blue mosaic tile grid + marketing text
 * Right panel: children (the form)
 */
const MosaicLoginLayout = ({ children, tagline, taglineHighlight, taglineDescription }) => {
    // Generate 64 tiles for the 8x8 grid
    const tiles = Array.from({ length: 64 }, (_, i) => i);

    return (
        <div className="login-page-wrapper">
            <div className="login-container animate-fadeIn">
                {/* Left Panel — Blue Mosaic Tiles */}
                <div className="login-left-panel">
                    {/* Top left logo inside image area */}
                    <div className="absolute top-6 left-6 z-10 w-12 h-12 rounded-xl overflow-hidden shadow-soft ring-4 ring-amber-50 opacity-0 animate-fadeIn animate-delay-1">
                        <img src="/logos/BloomNest-glass.png" alt="Bloomnest Logo" className="w-full h-full object-cover" />
                    </div>

                    {/* Mosaic Grid */}
                    <div className="mosaic-grid">
                        {tiles.map((tile) => (
                            <div key={tile} className="mosaic-tile" />
                        ))}
                    </div>

                    {/* Bottom text */}
                    <div className="login-left-text opacity-0 animate-fadeIn animate-delay-2">
                        <h2>
                            {tagline || 'Bloomnest'} <br />
                            <span>{taglineHighlight || 'Portal'}</span>
                        </h2>
                        <p>{taglineDescription || 'Therapy management made beautifully simple.'}</p>
                    </div>
                </div>

                {/* Right Panel — Form Area */}
                <div className="login-right-panel">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MosaicLoginLayout;
